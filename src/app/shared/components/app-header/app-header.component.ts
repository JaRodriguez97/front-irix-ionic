import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cameraOutline, 
  settingsOutline, 
  informationCircleOutline, 
  statsChartOutline,
  layersOutline,
  chevronBackOutline,
  stopCircleOutline,
  cameraReverseOutline,
  camera
} from 'ionicons/icons';

export interface HeaderAction {
  id: string;
  icon: string;
  label: string;
  color?: string;
  disabled?: boolean;
  badge?: number;
  active?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge
  ],
})
export class AppHeaderComponent {
  @Input() title: string = 'IRIX Camera';
  @Input() subtitle?: string;
  @Input() actions: HeaderAction[] = [];
  @Input() showBackButton: boolean = false;
  @Input() aiDetections: number = 0;
  
  @Output() actionClick = new EventEmitter<string>();
  @Output() backClick = new EventEmitter<void>();

  constructor() {
    addIcons({
      cameraOutline,
      settingsOutline,
      informationCircleOutline,
      statsChartOutline,
      layersOutline,
      chevronBackOutline,
      stopCircleOutline,
      cameraReverseOutline,
      camera
    });
  }

  onActionClick(actionId: string) {
    this.actionClick.emit(actionId);
  }

  onBackClick() {
    this.backClick.emit();
  }
}
