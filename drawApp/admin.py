from django.contrib import admin
from .models import DrawApp, SavedDrawings

# Register your models here.
class DrawAppAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'completed')

class SavedDrawingsAdmin(admin.ModelAdmin):
    list_display = ('username', 'saveId', 'saveName','corners')

# Register your models here.

admin.site.register(DrawApp, DrawAppAdmin)
admin.site.register(SavedDrawings, SavedDrawingsAdmin)