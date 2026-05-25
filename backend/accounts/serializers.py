from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Employee, Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'head']


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'email', 'name', 'personal_number', 'designation',
            'role', 'department', 'department_name', 'grade',
            'salary_band', 'acting_officer', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RegisterEmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = Employee
        fields = [
            'email', 'name', 'personal_number', 'designation',
            'role', 'department', 'grade', 'salary_band', 'password'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        employee = Employee(**validated_data)
        employee.set_password(password)
        employee.save()
        return employee


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError('No account found with this email.')
        return value


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['name', 'designation', 'leave_address', 'phone_during_leave']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # These fields don't exist on model yet — handled gracefully
        for field in ['leave_address', 'phone_during_leave']:
            self.fields.pop(field, None)