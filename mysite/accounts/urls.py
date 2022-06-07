from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'accounts'

urlpatterns = [
    #path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'),name="login"),
    path('logout/', auth_views.LogoutView.as_view(),name="logout"),
    path('signup/', views.signUp,name="signup"),
    path('<int:pk>/', views.AccountPage.as_view(), name='account_detail'),
    path("accept/<int:pk>/",views.AcceptContact.as_view(),name="accept_request"),
    path("reject/<int:pk>/",views.RejectContact.as_view(),name="reject_request"),
    path("delete/<int:pk>/",views.DeleteContact.as_view(),name="delete_contact"),
    path('', views.loginUser,name='login2'),
    path('login/', views.loginUser,name='login2'),
    path('search/', views.searchAccount,name='search'),


]
