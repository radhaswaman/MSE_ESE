# urls.py (app-level)
from django.urls import path
from . import views
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'endpoints': {
            'calculate': '/api/calculate/',
            'save': '/api/save/',
            'get_result': '/api/<reg_no>/'
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('calculate/', views.calculate,   name='calculate'),
    path('save/',      views.save_result, name='save_result'),
    path('<str:reg_no>/', views.get_result, name='get_result'),
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
