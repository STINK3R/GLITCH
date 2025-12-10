from enum import Enum


class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"


class UserStatus(Enum):
    ACTIVE = "active"
    DELETED = "deleted"
