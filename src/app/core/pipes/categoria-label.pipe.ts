import { Pipe, PipeTransform } from '@angular/core';
import { BeneficioCategoria, BENEFICIO_CATEGORIA_LABELS } from '@core/models/beneficio.model';

@Pipe({
  name: 'categoriaLabel',
  standalone: true,
  pure: true
})
export class CategoriaLabelPipe implements PipeTransform {
  transform(categoria: BeneficioCategoria): string {
    return BENEFICIO_CATEGORIA_LABELS[categoria] || categoria;
  }
}