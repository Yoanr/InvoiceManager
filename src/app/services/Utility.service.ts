import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class UtilityService {

    public static formatPrice(price: number): string {
        var priceStr = price.toFixed(2).toString();
        var index = (priceStr.length - 1) - 2 - 3;
        while (index > 0) {
            priceStr = priceStr.substring(0, index) + " " + priceStr.substring(index);
            index = index - 3;
        }
        return priceStr + " €";
    }

    public static _arrayBufferToBase64(buffer: Uint8Array): string {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    public static addLeadingZeros(num: number, totalLength: number): string {
        if (num < 0) {
            const withoutMinus = String(num).slice(1);
            return '-' + withoutMinus.padStart(totalLength, '0');
        }

        return String(num).padStart(totalLength, '0');
    }

    public static getDateStr(date: Date): string {
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();

        return dd + '/' + mm + '/' + yyyy;
    };

    public static getDateStrWithHour(date: Date): string {
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();

        return dd + '/' + mm + '/' + yyyy + ' à ' + (date as any).toLocaleTimeString();
    };

    public static ltrim(str: string): string {
        if (!str) return str;
        return str.replace(/^\s+/g, '');
    }
}
