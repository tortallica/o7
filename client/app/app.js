// @flow

import 'babel-polyfill';
import 'zone.js/dist/zone'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule, Component }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  template: '<div>Menu: <a href="/#/">Customers</a></div>'
})
class MenuComponent {}

class CustomerService {
  static instance=null;

  // Return singleton
  static get() {
    if(!CustomerService.instance)
      CustomerService.instance=new CustomerService();
    return CustomerService.instance;
  }

  getCustomers() {
    return fetch("/customers").then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }

  deleteCustomer(customerId){
      var body=JSON.stringify({});
      return fetch("/customers/" + customerId, {method: "DELETE", headers: new Headers({'Content-Type': 'application/json'}), body: body}).then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response;
    });
  }

  editCustomer(editName,editCity,customerId){
      var body=JSON.stringify({name: editName, city: editCity, id:customerId});
      return fetch("/customers/"+customerId,{method:"PUT", headers:new Headers({'Content-Type':'application/json'}), body:body}).then((response)=>{
          if(!response.ok){
              console.log("ec! kjører");
              console.log(response);
              throw response.statusText;
          }
          console.log(response);
          return response;
      });

  }

  getCustomer(customerId) {
    return fetch("/customers/"+customerId).then((response)=>{
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }

  addCustomer(name, city) {
    var body=JSON.stringify({name: name, city: city});
    return fetch("/customers", {method: "POST", headers: new Headers({'Content-Type': 'application/json'}), body: body}).then((response)=>{
        console.log(response);
      if(!response.ok) {
        throw response.statusText;
      }
      return response.json();
    });
  }
}

@Component({
  template: `<div>status: {{status}}</div>
             <ul>
               <li *ngFor="let customer of customers">
                 <a href="#/customer/{{customer.id}}">{{customer.name}}</a>
               </li>
             </ul>
             <form (ngSubmit)="$event.preventDefault(); onNewCustomer();" #newCustomerForm="ngForm">
               <input type="text" id="name" required name="name" [(ngModel)]="newCustomerName">
               <input type="text" id="city" required name="city" [(ngModel)]="newCustomerCity">
               <button type="submit" [disabled]="!newCustomerForm.form.valid">New Customer</button>
             </form>
             <form (ngSubmit)="onDeleteCustomer();" #deleteCustomerForm="ngForm">
               <input type="text" id="id" required name="id" [(ngModel)]="deleteId">
               <button type="submit">delete</button>
            </form>`
})
class CustomerListComponent {
  status="";
  customers=[];
  newCustomerName="";
  newCustomerCity="";

  constructor() {
    CustomerService.get().getCustomers().then((result)=>{
      this.status="successfully loaded customer list";
      this.customers=result;
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }
  onDeleteCustomer(){
      console.log("onDeleteCustomer runs");
      CustomerService.get().deleteCustomer(this.deleteId).then((result)=>{
          this.status="deleted";
          this.customers.splice(result,1)
      }).catch((reson)=>{
          this.status="error " + reson;
      });
  }

  onNewCustomer() {
    CustomerService.get().addCustomer(this.newCustomerName, this.newCustomerCity).then((result)=>{

      this.status="successfully added new customer";
      this.customers.push({id: result, name: this.newCustomerName, city: this.newCustomerCity});
      this.newCustomerName="";
      this.newCustomerCity="";
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }
}

@Component({
  template: `<div>status: {{status}}</div>
             <ul>
               <li>name: {{customer.name}}</li>
               <li>city: {{customer.city}}</li>
             </ul>
             <form (ngSubmit)="onEditCustomer();" #editCustomerForm="ngForm">
               <input type="text" required name="name"  [(ngModel)]="editName">
               <input type="text" required name="city"  [(ngModel)]="editCity">
               <button type="submit">Edit</button>
            </form>`
})



class CustomerDetailsComponent {
  status="";
  customer={};

  constructor(route: ActivatedRoute) {
    CustomerService.get().getCustomer(route.params.value.id).then((result)=>{
      this.status="successfully loaded customer details";
      this.customer=result;
    }).catch((reason)=>{
      this.status="error: "+reason;
    });
  }

  onEditCustomer(){
      CustomerService.get().editCustomer(this.editName, this.editCity, this.customer.id).then((result)=>{

          this.customer = {id: this.customer.id, name:this.editName, city:this.editCity};
          console.log("oec kjører");
      }).catch((reason)=>{
          this.status="error: "+reason;
      });
  }
}

@Component({
  selector: 'app',
  template: `<app-menu></app-menu>
             <router-outlet></router-outlet>`
})
class AppComponent {}

const routing = RouterModule.forRoot([
  { path: '', component: CustomerListComponent },
  { path: 'customer/:id', component: CustomerDetailsComponent },
]);

@NgModule({
  imports:      [ BrowserModule, routing, FormsModule ],
  declarations: [ MenuComponent, CustomerListComponent, CustomerDetailsComponent, AppComponent ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap:    [ AppComponent ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
