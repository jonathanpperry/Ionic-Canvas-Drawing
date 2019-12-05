import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Platform, ToastController } from "@ionic/angular";
import {
  Base64ToGallery,
  Base64ToGalleryOptions
} from "@ionic-native/base64-to-gallery/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements AfterViewInit {
  @ViewChild("imageCanvas", { static: false }) canvas: any;
  canvasElement: any;
  saveX: number;
  saveY: number;
  drawing = false;

  selectedColor = "#9e2956";
  colors = [
    "#9e2956",
    "#c2281d",
    "#de722f",
    "#edbf4c",
    "#5db37e",
    "#459cde",
    "#4250ad",
    "#802fa3"
  ];
  lineWidth = 7;

  constructor(
    private plt: Platform,
    private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController
  ) {}

  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + "";
    this.canvasElement.height = 200;
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  startDrawing(ev) {
    console.log(ev);
    this.drawing = true;
    const canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;
  }

  startDrawingMobile(ev) {
    console.log(ev);
    this.drawing = true;
    const canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  moved(ev) {
    if (!this.drawing) return;
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext("2d");

    let currentX = ev.pageX - canvasPosition.x;
    let currentY = ev.pageY - canvasPosition.y;

    ctx.lineJoin = "round";
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  movedMobile(ev) {
    if (!this.drawing) return;
    const canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext("2d");

    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;

    ctx.lineJoin = "round";
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  setBackground() {
    var background = new Image();
    background.src = "./assets/coupon_pic_lg.png";
    let ctx = this.canvasElement.getContext("2d");

    background.onload = () => {
      ctx.drawImage(
        background,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    };
  }

  clearCanvas() {
    let ctx = this.canvasElement.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  exportCanvasImage() {
    const dataUrl = this.canvasElement.toDataURL();
    console.log("image: ", dataUrl);
    this.clearCanvas();
    if (this.plt.is("cordova")) {
      const options: Base64ToGalleryOptions = {
        prefix: "canvas_",
        mediaScanner: true
      };

      this.base64ToGallery.base64ToGallery(dataUrl, options).then(
        async res => {
          const toast = await this.toastCtrl.create({
            message: "Image saved to camera roll.",
            duration: 2000
          });
          toast.present();
        },
        err => console.log("Error saving image to gallery ", err)
      );
    } else {
      var data = dataUrl.split(",")[1];
      let blob = this.b64toBlob(data, "image/png");

      var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = "canvasimage.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  b64toBlob(b64Data, contentType) {
    contentType = contentType || "";
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
