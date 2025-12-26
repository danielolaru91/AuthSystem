import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[canRole]',
  standalone: true
})
export class CanRoleDirective {
  private auth = inject(AuthService);
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);

  private requiredRoles: string[] = [];

  @Input() set canRole(roleOrRoles: string | string[]) {
    this.requiredRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.updateView();
    });
  }

  private updateView() {
    const currentRole = this.auth.role();
    if (!currentRole) {
      this.vcr.clear();
      return;
    }

    const allowed = this.requiredRoles.includes(currentRole);

    this.vcr.clear();
    if (allowed) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
