from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    head = models.ForeignKey(
        'Employee', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='headed_departments'
    )

    def __str__(self):
        return self.name


class EmployeeManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, password, **extra_fields)


class Employee(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('EMPLOYEE', 'Employee'),
        ('SUPERVISOR', 'Supervisor / HOD'),
        ('HR_OFFICER', 'HR Officer'),
        ('HEAD_HR', 'Head of HR'),
        ('ADMIN', 'Admin'),
    ]

    GRADE_CHOICES = [
        ('KFS_1', 'KFS Grade 1'),
        ('KFS_2', 'KFS Grade 2'),
        ('KFS_3', 'KFS Grade 3'),
        ('KFS_4', 'KFS Grade 4'),
        ('KFS_5', 'KFS Grade 5'),
        ('KFS_6', 'KFS Grade 6'),
        ('KFS_7', 'KFS Grade 7'),
        ('KFS_8', 'KFS Grade 8'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    personal_number = models.CharField(max_length=20, unique=True)
    designation = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    department = models.ForeignKey(
        Department, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='employees'
    )
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, blank=True)
    salary_band = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    acting_officer = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='acting_for'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'personal_number']

    objects = EmployeeManager()

    def __str__(self):
        return f"{self.name} ({self.personal_number})"