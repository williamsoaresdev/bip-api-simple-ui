import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
    selector: 'bip-root',
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule
    ],
    template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Overlay quando menu estiver aberto -->
      <div class="menu-overlay" 
           [class.active]="isMenuOpen" 
           (click)="closeMenu()"></div>
           
      <!-- Side Navigation -->
      <mat-sidenav 
        #drawer 
        class="sidenav" 
        fixedInViewport
        [attr.role]="'navigation'"
        mode="over"
        [opened]="isMenuOpen"
        (closed)="closeMenu()">
        
        <!-- Sidenav Header -->
        <div class="sidenav-header">
          <div class="logo-container">
            <div class="logo-icon">💰</div>
            <div class="logo-text">
              <h2>BIP</h2>
              <p>Sistema de Benefícios</p>
            </div>
          </div>
          <!-- Botão para fechar o menu -->
          <button mat-icon-button class="close-button" (click)="closeMenu()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <!-- Navigation Menu -->
        <div class="nav-list">
          <div class="nav-section">
            <h3 class="nav-section-title">MENU PRINCIPAL</h3>
            
            <div class="nav-items-container">
              <a *ngFor="let item of navigationItems"
                 [routerLink]="item.route" 
                 routerLinkActive="active"
                 class="nav-item"
                 (click)="closeMenu()"
                 [attr.aria-label]="item.description">
                <mat-icon class="nav-icon {{ 'nav-icon-' + item.icon }}">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Sidenav Footer -->
        <div class="sidenav-footer">
          <div class="user-info">
            <mat-icon class="user-avatar">account_circle</mat-icon>
            <div class="user-details">
              <span class="user-name">Usuário Admin</span>
              <span class="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </mat-sidenav>
      
      <!-- Main Content -->
      <mat-sidenav-content class="main-container">
        <!-- Top Toolbar -->
        <mat-toolbar color="primary" class="main-toolbar" elevation="2">
          <button
            type="button"
            aria-label="Abrir menu"
            mat-icon-button
            (click)="toggleMenu()"
            class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          
          <div class="toolbar-content">
            <div class="page-info">
              <h1 class="page-title">{{ currentPageTitle }}</h1>
              <span class="page-subtitle">{{ currentPageSubtitle }}</span>
            </div>
            
            <div class="toolbar-actions">
              <div class="user-info-toolbar">
                <mat-icon class="user-avatar-small">account_circle</mat-icon>
                <span class="user-name-toolbar">Admin</span>
              </div>
            </div>
          </div>
        </mat-toolbar>
        
        <!-- Page Content -->
        <main class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
    styles: [`
    /* ===== CONTAINER PRINCIPAL ===== */
    .sidenav-container {
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      
      &.active {
        opacity: 1;
        visibility: visible;
      }
    }

    /* ===== SIDENAV ===== */
    .sidenav {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    }

    .sidenav-header {
      padding: 24px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
    }

    .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      color: rgba(255, 255, 255, 0.9);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 32px;
      line-height: 1;
    }

    .logo-text h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .logo-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      font-weight: 400;
    }

    /* ===== NAVEGAÇÃO ===== */
    .nav-list {
      padding: 16px 0;
      height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .nav-section {
      padding: 0 20px 16px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.5px;
      margin: 0 0 12px 0;
      text-transform: uppercase;
    }

    .nav-items-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-item {
      margin: 0;
      border-radius: 12px;
      transition: all 0.3s ease;
      min-height: 52px;
      display: flex !important;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: #334155;
      border: 1px solid transparent;
      background: transparent;
      
      &:hover {
        background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
        transform: translateX(6px);
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-decoration: none;
        color: #1e293b;
      }
      
      &.active {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white !important;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        border-color: #667eea;
        text-decoration: none;
        
        .nav-label {
          font-weight: 700;
          color: white !important;
        }
        
        .nav-icon {
          color: white !important;
        }
      }
    }

    .nav-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 15px;
      font-weight: 600;
      color: inherit;
      line-height: 1.4;
      flex: 1;
    }

    .nav-divider {
      margin: 16px 20px;
      border-color: #e2e8f0;
    }

    /* ===== ÍCONES COLORIDOS ===== */
    .nav-icon-dashboard { 
      color: #3b82f6 !important; 
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .nav-icon-card_giftcard { 
      color: #10b981 !important; 
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .nav-icon-swap_horiz { 
      color: #f59e0b !important; 
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .nav-icon-settings { 
      color: #6b7280 !important; 
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .nav-icon-help { 
      color: #8b5cf6 !important; 
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .nav-item.active .mat-icon {
      color: white !important;
    }

    /* ===== FOOTER DO SIDENAV ===== */
    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      font-size: 32px;
      color: #64748b;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .user-role {
      font-size: 11px;
      color: #64748b;
    }

    /* ===== TOOLBAR PRINCIPAL ===== */
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-left: 8px;
    }

    .page-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .user-info-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar-small {
      color: rgba(255, 255, 255, 0.9);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .user-name-toolbar {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
    }

    .menu-button {
      margin-right: 8px;
      color: white;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    /* ===== CONTEÚDO PRINCIPAL ===== */
    .main-container {
      background: #f8fafc;
      width: 100%;
    }

    .main-content {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .content-wrapper {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* ===== RESPONSIVIDADE ===== */
    @media (max-width: 768px) {
      .sidenav {
        width: 100vw;
        max-width: 320px;
      }

      .content-wrapper {
        padding: 16px;
      }

      .page-info {
        display: flex;
        flex-direction: column;
      }

      .toolbar-content {
        justify-content: space-between;
        margin-left: 0;
      }

      .sidenav-footer {
        padding: 12px 16px;
      }
    }

    @media (max-width: 480px) {
      .content-wrapper {
        padding: 12px;
      }
    }

    /* ===== ANIMAÇÕES ===== */
    .nav-item,
    .action-button,
    .menu-button {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidenav {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    /* ===== SCROLLBAR CUSTOMIZADA ===== */
    .nav-list::-webkit-scrollbar {
      width: 4px;
    }

    .nav-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .nav-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }

    .nav-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'BIP API - Sistema de Gestão de Benefícios';
  
  currentPageTitle = 'Dashboard';
  currentPageSubtitle = 'Visão geral do sistema';

  navigationItems: NavItem[] = [
    {
      route: '/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      description: 'Visão geral e estatísticas do sistema'
    },
    {
      route: '/beneficios',
      label: 'Benefícios',
      icon: 'card_giftcard',
      description: 'Gerenciar benefícios e valores'
    },
    {
      route: '/transferencias',
      label: 'Transferências',
      icon: 'swap_horiz',
      description: 'Realizar e consultar transferências'
    }
  ];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // Controla se o menu está aberto ou fechado
  isMenuOpen = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updatePageTitle();
    
    // Atualiza o título da página quando a rota muda
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) {
      this.currentPageTitle = 'Dashboard';
      this.currentPageSubtitle = 'Visão geral do sistema';
    } else if (url.includes('/beneficios')) {
      if (url.includes('/novo')) {
        this.currentPageTitle = 'Novo Benefício';
        this.currentPageSubtitle = 'Criar um novo benefício';
      } else if (url.includes('/editar')) {
        this.currentPageTitle = 'Editar Benefício';
        this.currentPageSubtitle = 'Modificar dados do benefício';
      } else {
        this.currentPageTitle = 'Benefícios';
        this.currentPageSubtitle = 'Gerenciar benefícios do sistema';
      }
    } else if (url.includes('/transferencias')) {
      if (url.includes('/novo')) {
        this.currentPageTitle = 'Nova Transferência';
        this.currentPageSubtitle = 'Realizar transferência entre benefícios';
      } else {
        this.currentPageTitle = 'Transferências';
        this.currentPageSubtitle = 'Histórico de transferências realizadas';
      }
    } else {
      this.currentPageTitle = 'BIP Sistema';
      this.currentPageSubtitle = 'Sistema de Gestão de Benefícios';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}