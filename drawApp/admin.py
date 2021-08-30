from django.contrib import admin
from .models import DrawApp, SavedDrawings#, CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

# from .forms import CustomUserChangeForm, CustomUserCreationForm

# Register your models here.
class DrawAppAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'completed')

class SavedDrawingsAdmin(admin.ModelAdmin):
    list_display = ('username', 'saveId', 'saveName','corners')

# class CustomUserAdmin(UserAdmin):    
#     add_form = CustomUserCreationForm
#     form = CustomUserChangeForm
#     model = CustomUser
#     list_display = ['email']

# Register your models here.

admin.site.register(DrawApp, DrawAppAdmin)
admin.site.register(SavedDrawings, SavedDrawingsAdmin)
# admin.site.register(CustomUser, CustomUserAdmin)