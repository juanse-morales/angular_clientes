import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AuthService } from '../usuarios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint: string = "http://localhost:8080/api/clientes";
  // private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(private http: HttpClient,
    private router: Router, 
    private authService: AuthService) { }

  /* private agregarAuthorizationHeader(){
    let token = this.authService.token;
    if(token != null){
      return this.httpHeaders.append('Authorization', 'Bearer '+token);
    }
    return this.httpHeaders;
  } */

  private isNoAutorizado(e): boolean{
    if(e.status==401){

      if(this.authService.isAuthenticated()){
        this.authService.logout();
      }

      this.router.navigate(['/login']);
      return true;
    }
    
    if(e.status==403){
      Swal.fire('Accesso denegado', `Hola ${this.authService.usuario.username} no tienes accesso a este recurso`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }
    return false;
  }

  /* getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones', {header: this.agregarAuthorizationHeader()}).pipe(
      catchError(e => {
        this.isNoAutorizado(e);
        return throwError(e);
      })
    );
  } */

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      /* tap((response: any)=>{
        console.log('ClienteService');
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        });
      }), */
      map((response: any)=>{
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          
          cliente.createAt = formatDate(cliente.createAt, 'EEEE dd, MMMM yyyy', 'es');
          return cliente;
        });
        return response;
      })
    );
  }

  create(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.urlEndPoint, cliente).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        
        if(e.status == 400){
          return throwError(e);
        }
        console.error(e.error.error);
        Swal.fire('Error al crear el cliente: '+e.error.error, e.error.error_description, 'error');
        return throwError(e);
      })
    );
  }

  getCliente(id): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        this.router.navigate(['/clientes']);
        console.error(e.error.error);
        Swal.fire('Error al editar: '+e.error.error, e.error.error_description, 'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<Cliente> {
    return this.http.put(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        if(e.status == 400){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        Swal.fire('Error al editar el cliente: '+e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(this.isNoAutorizado(e)){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        Swal.fire('Error al eliminar el cliente', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<Cliente>{
    let formData = new FormData();
    formData.append("arhivo", archivo);
    formData.append("id", id);

    return this.http.post(`${this.urlEndPoint}/upload/`, formData).pipe(
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {
        console.error(e.error.error);
        Swal.fire('Error al cargar la imagen: '+e.error.error, e.error.error_description, 'error');
        return throwError(e);
      })
    );
  }
}
