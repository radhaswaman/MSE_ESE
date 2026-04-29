# urls.py (app-level)
from django.urls import path
from . import views

urlpatterns = [
    path('result/calculate/', views.calculate,   name='calculate'),
    path('result/save/',      views.save_result, name='save_result'),
    path('result/<str:reg_no>/', views.get_result, name='get_result'),
]


# ─────────────────────────────────────────────
# urls.py (project-level) — add to urlpatterns:
# ─────────────────────────────────────────────
# from django.urls import path, include
# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('result.urls')),   # <-- add this
# ]


# ─────────────────────────────────────────────
# settings.py additions
# ─────────────────────────────────────────────
# INSTALLED_APPS += ['corsheaders', 'result']
#
# MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...existing...]
#
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",   # React dev server
# ]
#
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'vit_results',
#         'USER': 'root',
#         'PASSWORD': 'your_password',
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }
