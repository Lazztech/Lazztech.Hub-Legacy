import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';
import { AlertService } from 'src/app/services/alert.service';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HubService } from 'src/app/services/hub.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-hub',
  templateUrl: './add-hub.page.html',
  styleUrls: ['./add-hub.page.scss'],
})
export class AddHubPage implements OnInit {

  image: any;

  loading = false;

  myForm: FormGroup;

  get hubName() {
    return this.myForm.get('hubName');
  }

  constructor(
    private hubService: HubService,
    private alertService: AlertService,
    private fb: FormBuilder,
    public navCtrl: NavController,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      hubName: ['', [
        Validators.required
      ]]
    });

    this.myForm.valueChanges.subscribe();
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    // this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    this.image = image.dataUrl;
  }

  async selectPicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    // this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    this.image = image.dataUrl;
  }

  async saveHub() {
    this.loading = true;

    const formValue = this.myForm.value;
    //FIXME: add latitude and longitude
    const result = await this.hubService.createHub(formValue.hubName, this.image, "", "");
    if (result) {
      this.loading = false;
      this.navCtrl.navigateRoot('tabs/hubs');
      this.alertService.presentToast("Created Hub!");
    } else {
      this.loading = false;
      this.alertService.presentRedToast("Failed to create Hub.");
    }
  }


}
