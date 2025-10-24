import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'bip-transferencias-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="transferencias-container">
      <mat-card class="bip-card">
        <div class="bip-card-header">
          <h1>🔄 Transferências</h1>
          <p>Gerencie transferências entre benefícios</p>
        </div>
        <div class="bip-card-content">
          <div class="coming-soon">
            <mat-icon class="icon-large">construction</mat-icon>
            <h2>Em Desenvolvimento</h2>
            <p>O módulo de transferências estará disponível em breve!</p>
            <button mat-raised-button color="primary" routerLink="/beneficios">
              <mat-icon>arrow_back</mat-icon>
              Voltar aos Benefícios
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .transferencias-container {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .coming-soon {
      text-align: center;
      padding: 48px 24px;
    }

    .icon-large {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
      margin-bottom: 16px;
    }

    .coming-soon h2 {
      color: #333;
      margin-bottom: 8px;
    }

    .coming-soon p {
      color: #666;
      margin-bottom: 24px;
    }
  `]
})
export class TransferenciasListComponent {}