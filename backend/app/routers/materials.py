import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.database import get_db
from app.models import Material
from app.schemas import MaterialOut
from app.services.file_parser import FileParserService

router = APIRouter()
file_parser = FileParserService(max_size_mb=settings.max_upload_size_mb)

UPLOAD_DIR = "uploads"


@router.post("/materials/upload", response_model=MaterialOut)
async def upload_material(file: UploadFile, db: DBSession = Depends(get_db)):
    if not file_parser.validate_file_type(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and PPTX are allowed.")

    content = await file.read()
    file_size = len(content)

    if not file_parser.validate_file_size(file_size):
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_upload_size_mb}MB.",
        )

    # Save file to disk with UUID prefix to avoid collisions
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse file
    try:
        extracted_text = file_parser.parse_file(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not extracted_text or not extracted_text.strip():
        extracted_text = ""

    material = Material(
        file_name=file.filename,
        stored_name=stored_name,
        file_type=file_parser.get_file_extension(file.filename),
        file_size=file_size,
        extracted_text=extracted_text,
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    return material


@router.get("/materials", response_model=list[MaterialOut])
def list_materials(db: DBSession = Depends(get_db)):
    return db.query(Material).order_by(Material.upload_date.desc()).all()


@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: DBSession = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Delete file from disk using stored_name (UUID-prefixed)
    file_path = os.path.join(UPLOAD_DIR, material.stored_name)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(material)
    db.commit()
    return {"ok": True}
