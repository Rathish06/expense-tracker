from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Category
from routers.auth import verify_password
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_current_user(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    return user

@router.post("/")
async def create_category(
    name: str = Form(...),
    description: str = Form(None),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    
    # Check if category with same name exists for user
    if db.query(Category).filter(
        Category.name == name,
        Category.user_id == current_user.id
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category = Category(
        name=name,
        description=description,
        user_id=current_user.id
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/")
async def get_categories(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    return categories

@router.get("/{category_id}")
async def get_category(
    category_id: int,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.put("/{category_id}")
async def update_category(
    category_id: int,
    name: str = Form(...),
    description: str = Form(None),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with existing category
    existing_category = db.query(Category).filter(
        Category.name == name,
        Category.user_id == current_user.id,
        Category.id != category_id
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category.name = name
    category.description = description
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has associated expenses
    if category.expenses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with associated expenses"
        )
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"} 