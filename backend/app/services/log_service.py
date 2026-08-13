import os
import shutil
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.models.log import LogFile
from app.utils.logger import logger

class LogService:
    def save_uploaded_file(self, file: UploadFile, db: Session) -> LogFile:
        """Validates and saves an uploaded proxy log file to disk & database."""
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided in upload payload."
            )
            
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            logger.error(f"Failed to save uploaded log file '{file.filename}': {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save log file to server storage: {str(e)}"
            )

        # Check if empty file
        if os.path.getsize(file_path) == 0:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded log file is empty (0 bytes)."
            )

        # Save record in DB
        log_record = LogFile(
            filename=file.filename,
            file_path=file_path,
            log_type="AUTO_DETECT",
            status="UPLOADED"
        )
        db.add(log_record)
        db.commit()
        db.refresh(log_record)

        logger.info(f"File '{file.filename}' uploaded successfully (ID: {log_record.id}).")
        return log_record

log_service = LogService()
