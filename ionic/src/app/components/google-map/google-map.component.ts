import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges, ElementRef } from '@angular/core';
/// <reference types="@types/googlemaps" />
import { darkStyle } from './map-dark-style';
import { GOOGLE_MAPS_KEY } from 'src/environments/environment.prod';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements AfterViewInit {

  @Input() 
  center: { latitude: any; longitude: any; };

  @Input()
  hubs = [];

  @Input()
  navOnMarker = false;

  @Input()
  showControls = false;

  @ViewChild('mapCanvas') mapElement: ElementRef;
  map: any;

  constructor(
    public navCtrl: NavController,
  ) { }

  ngAfterViewInit() {
    this.initMap();
  }

  updateMap() {
    // google.maps.event.trigger(this.map, 'resize');
    this.initMap();
  }

  async initMap() {
    const position = { lat: this.center.latitude, lng: this.center.longitude };
    const googleMaps = await this.getGoogleMaps(
      GOOGLE_MAPS_KEY
    );

    let mapOptions: google.maps.MapOptions = {
      center: position,
      zoom: 13,
      disableDefaultUI: !this.showControls,
      draggable: this.showControls,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      // styles: darkStyle
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    if (this.hubs && this.hubs.length) {
      for (let index = 0; index < this.hubs.length; index++) {
        const hub = this.hubs[index];
        const position = { lat: this.hubs[index].latitude, lng: this.hubs[index].longitude };
  
        let marker = new google.maps.Marker({
          position: position,
          map: this.map
        });

        if (this.navOnMarker) {
          marker.addListener('click', () => {
            this.navCtrl.navigateForward('hub/'+ hub.id);
          });
        }
      }
    } else {
      let marker = new google.maps.Marker({
        position: { lat: this.center.latitude, lng: this.center.longitude },
        map: this.map
      });
    }

    googleMaps.event.addListenerOnce(this.map, 'idle', () => {
      this.mapElement.nativeElement.classList.add('show-map');
    });
  }

  getGoogleMaps(apiKey: string): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
  
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const googleModule2 = win.google;
        if (googleModule2 && googleModule2.maps) {
          resolve(googleModule2.maps);
        } else {
          reject('google maps not available');
        }
      };
    });
  }

}
