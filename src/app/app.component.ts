import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
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
        MatListModule,
        MatDividerModule,
        MatRippleModule
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
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

  trackByRoute(_index: number, item: NavItem): string {
    return item.route;
  }
}