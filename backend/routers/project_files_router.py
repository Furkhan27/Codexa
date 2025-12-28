from fastapi import APIRouter, HTTPException
from utils.database_util import files_col
from bson import ObjectId

router = APIRouter(prefix="/files")


@router.get("/{project_id}")
def get_project_files(project_id: str):
    files = list(
        files_col.find(
            {"project_id": ObjectId(project_id)},
            {"content": 1, "path": 1}
        )
    )

    if not files:
        raise HTTPException(status_code=404, detail="No files found")

    for f in files:
        f["_id"] = str(f["_id"])

    return {
        "ok": True,
        "files": files
    }


