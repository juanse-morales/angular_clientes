import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginador: any;

  constructor(private clienteService: ClienteService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params=>{
      let page:number = +params.get('page');
      if(!page) page=0;
      this.clienteService.getClientes(page).subscribe(response => { 
        this.clientes = response.content as Cliente[];
        this.paginador = response;
      });
    });
  }

  delete(cliente: Cliente): void {
    const swalWithBootstrapButtons = swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    });
    
    swalWithBootstrapButtons.fire({
      title: 'Estás seguro?',
      text: `¿Seguro que desea eliminar al cliente ${cliente.nombre+' '+cliente.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        this.clienteService.delete(cliente.id).subscribe(response=>{
          this.clientes = this.clientes.filter(cli => cli !== cliente);
          swalWithBootstrapButtons.fire(
            'Cliente Eliminado!',
            `El cliente ${cliente.nombre+' '+cliente.apellido} ha sido eliminado con éxito.`,
            'success'
          );
        });
        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelado',
          'Tu cliente está seguro :)',
          'error'
        )
      }
    });
  }

}
