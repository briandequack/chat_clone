from django.contrib.auth import login, logout, authenticate
from django.urls import reverse_lazy
from django.views import generic
from django.shortcuts import render, redirect, reverse
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect, HttpResponse
User = get_user_model()
from . import forms
from . import models

def signUp(request):
    form = forms.UserCreateForm()
    if request.method == "POST":
        form = forms.UserCreateForm(request.POST)
        if form.is_valid():
            user=form.save()
            user.save()
            models.ContactList.objects.create(user=user)
            models.MainSession.objects.create(user=user)


            return redirect('login')

    return render(request, 'accounts/signup.html', {'form':form})


def loginUser(request):


    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username,password=password)

        if user:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect(reverse('chat:meetings'))

            else:
                return HttpResponse("Account not active")
        else:
            print('Someone tried to login and failed')
            print('Username: {} and Password: {}'.format(username,password))
            return HttpResponse("Invalid credentials")
    else:
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse('chat:meetings'))
        else:
            return render(request,'accounts/login2.html')


class AcceptContact(generic.RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        contact_request = models.ContactRequest.objects.get(pk=self.kwargs.get("pk"))
        contact_request.accept()
        return reverse("accounts:account_detail", kwargs={"pk":self.request.user.pk})

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class RejectContact(generic.RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        contact_request = models.ContactRequest.objects.get(pk=self.kwargs.get("pk"))
        contact_request.delete()
        return reverse("accounts:account_detail", kwargs={"pk":self.request.user.pk})

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class DeleteContact(generic.RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        contact_request = models.ContactRequest.objects.get(pk=self.kwargs.get("pk"))
        contact_request.delete()
        return reverse("accounts:account_detail", kwargs={"pk":self.request.user.pk})

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


def searchAccount(request):
    result = ''
    if request.method == "POST":
        search_query = request.POST.get('name')
        result = User.objects.filter(username__icontains=search_query)

    return render(request, 'accounts/search_contact.html',{'users':result})


class AccountPage(generic.DetailView):
    model = User
    template_name = 'accounts/user_detail.html'
