from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Employee, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'head')
    search_fields = ('name',)


@admin.register(Employee)
class EmployeeAdmin(UserAdmin):
    model = Employee
    list_display = ('email', 'name', 'personal_number', 'role', 'department', 'grade', 'is_active')
    list_filter = ('role', 'department', 'grade', 'is_active')
    search_fields = ('email', 'name', 'personal_number')
    ordering = ('name',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'personal_number', 'designation')}),
        ('KFS Info', {'fields': ('role', 'department', 'grade', 'salary_band', 'acting_officer')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'personal_number', 'designation', 'role',
                       'department', 'grade', 'salary_band', 'password1', 'password2'),
        }),
    )