import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  public cliente: any = new Cliente();
  public titulo: string = "Crear cliente";

  public errores: string[];

  constructor(private clienteService: ClienteService, 
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id){
        this.clienteService.getCliente(id).subscribe(cliente=>this.cliente=cliente);
      }
    });
  }

  create(): void {
    this.clienteService.create(this.cliente).subscribe(
      data => {
        this.router.navigate(['/clientes']);
        swal.fire('Cliente guardado', data.mensaje, 'success');
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error('Código del error desde el backend: '+ err.status);
        console.error(err.error.errors);
      }
    );
  }

  update(): void {
    this.clienteService.update(this.cliente).subscribe( data => {
      this.router.navigate(['/clientes']);
      swal.fire('Cliente Actualizado', `Cliente ${data.nombre+' '+data.apellido} actualizado con éxito!`, 'success');
    },
    err => {
      this.errores = err.error.errors as string[];
      console.error('Código del error desde el backend: '+ err.status);
      console.error(err.error.errors);
    })
  }

}
