function getGmtDateTime(dt, tm, offset) {
    var dt1 = nlapiStringToDate(dt);
    var dt2 = nlapiStringToDate(tm);
    dt1.setHours(dt2.getHours());
    dt1.setMinutes(dt2.getMinutes());
    dt1.setHours(dt1.getHours() - offset);
    return dt1;
}

function getServerTimeZoneOffset() {
    var dt = new Date();
    return dt.getTimezoneOffset() / 60;
}

function getServerDateTime(dt) {
    var tmzo = getServerTimeZoneOffset();
    dt.setHours(dt.getHours() - tmzo);
    return dt;
}

function getCurrentDateTimeTz(offset, dayLight) {
    var dt = new Date();
    var tmzo = getServerTimeZoneOffset();
    var h = 0;
    var m = 0;
    var s = 0;
    var am = '';
    if (!isBlankOrNull(offset)) {
        if (offset.indexOf('_') >= 0) {
            offset = offset.substring(0, offset.indexOf('_'));
        }
        offset = parseFloat(offset);
    }
    else {
        offset = 0;
    }
    offset = offset + (dayLight == 'T' ? 1 : 0);
    dt.setHours(dt.getHours() + tmzo + offset);

    h = dt.getHours();
    if (h > 12) {
        am = ' pm';
    } else {
        am = ' am';
    }
    if (h > 12) {
        h = h - 12;
    }
    if (h == 0) {
        h = 12;
    }
    if (h < 10) {
        h = '0' + '' + h;
    }

    m = dt.getMinutes();
    if (m < 10) {
        m = '0' + '' + m;
    }

    s = dt.getSeconds();
    if (s < 10) {
        s = '0' + '' + s;
    }

    return (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear() + ' ' + h + ':' + m + ':' + s + am + ' GMT' +
        getGMTString(offset);
}

function getGMTString(offset) {
    var gmt = '';
    var sign = '+';
    var n1 = 0;
    var n2 = 0;
    if (offset != 0) {
        if (offset < 0) {
            sign = '-';
        }
        offset = Math.abs(offset);
        n1 = parseInt(offset);
        n2 = (offset - n1) * 60;
        if (n2 < 10) {
            if (n2 == 0) n2 = '00';
            else n2 = '0' + '' + n2;
        }
        if (offset < 10) {
            gmt = sign + '0';
        }
        else {
            gmt = sign;
        }
        gmt += (n1 + '' + n2);
    }
    return gmt;
}

function fillTimeZones(obj) {
    obj.addSelectOption('0_a', '');
    obj.addSelectOption('-12_a', '(GMT-12:00) International Date Line West');
    obj.addSelectOption('-11_a', '(GMT-11:00) Midway Island, Samoa');
    obj.addSelectOption('-10_a', '(GMT-10:00) Hawaii');
    obj.addSelectOption('-9_a', '(GMT-09:00) Alaska');
    obj.addSelectOption('-8_a', '(GMT-08:00) Pacific Time (US &amp; Canada)');
    obj.addSelectOption('-8_b', '(GMT-08:00) Tijuana, Baja California');
    obj.addSelectOption('-7_a', '(GMT-07:00) Mountain Time (US &amp; Canada)');
    obj.addSelectOption('-7_b', '(GMT-07:00) Arizona');
    obj.addSelectOption('-7_c', '(GMT-07:00) Chihuahua, La Paz, Mazatlan - New');
    obj.addSelectOption('-6_a', '(GMT-06:00) Central Time (US &amp; Canada)');
    obj.addSelectOption('-6_b', '(GMT-06:00) Saskatchewan');
    obj.addSelectOption('-6_c', '(GMT-06:00) Central America');
    obj.addSelectOption('-6_d', '(GMT-06:00) Guadalajara, Mexico City, Monterrey - Old');
    obj.addSelectOption('-5_a', '(GMT-05:00) Eastern Time (US &amp; Canada)');
    obj.addSelectOption('-5_b', '(GMT-05:00) Indiana (East)');
    obj.addSelectOption('-5_c', '(GMT-05:00) Bogota, Lima, Quito');
    obj.addSelectOption('-4.5_a', '(GMT-04:30) Caracas');
    obj.addSelectOption('-4_a', '(GMT-04:00) Atlantic Time (Canada)');
    obj.addSelectOption('-4_b', '(GMT-04:00) Georgetown, La Paz, San Juan');
    obj.addSelectOption('-4_c', '(GMT-04:00) Manaus');
    obj.addSelectOption('-4_d', '(GMT-04:00) Santiago');
    obj.addSelectOption('-3.5_a', '(GMT-03:30) Newfoundland');
    obj.addSelectOption('-3_a', '(GMT-03:00) Brasilia');
    obj.addSelectOption('-3_b', '(GMT-03:00) Buenos Aires');
    obj.addSelectOption('-3_c', '(GMT-03:00) Cayenne');
    obj.addSelectOption('-3_d', '(GMT-03:00) Greenland');
    obj.addSelectOption('-3_e', '(GMT-03:00) Montevideo');
    obj.addSelectOption('-2_a', '(GMT-02:00) Mid-Atlantic');
    obj.addSelectOption('-1_a', '(GMT-01:00) Cape Verde Is.');
    obj.addSelectOption('-1_b', '(GMT-01:00) Azores');
    obj.addSelectOption('0_b', '(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London');
    obj.addSelectOption('0_c', '(GMT) Casablanca');
    obj.addSelectOption('0_d', '(GMT) Monrovia, Reykjavik');
    obj.addSelectOption('1_a', '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb');
    obj.addSelectOption('1_b', '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris');
    obj.addSelectOption('1_c', '(GMT+01:00) West Central Africa');
    obj.addSelectOption('1_d', '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna');
    obj.addSelectOption('1_e', '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague');
    obj.addSelectOption('2_a', '(GMT+02:00) Cairo');
    obj.addSelectOption('2_b', '(GMT+02:00) Athens, Bucharest, Istanbul');
    obj.addSelectOption('2_c', '(GMT+02:00) Jerusalem');
    obj.addSelectOption('2_d', '(GMT+02:00) Amman');
    obj.addSelectOption('2_e', '(GMT+02:00) Beirut');
    obj.addSelectOption('2_f', '(GMT+02:00) Harare, Pretoria');
    obj.addSelectOption('2_g', '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius');
    obj.addSelectOption('2_h', '(GMT+02:00) Minsk');
    obj.addSelectOption('2_i', '(GMT+02:00) Windhoek');
    obj.addSelectOption('3_a', '(GMT+03:00) Kuwait, Riyadh');
    obj.addSelectOption('3_b', '(GMT+03:00) Moscow, St. Petersburg, Volgograd');
    obj.addSelectOption('3_c', '(GMT+03:00) Baghdad');
    obj.addSelectOption('3_d', '(GMT+03:00) Nairobi');
    obj.addSelectOption('3.5_a', '(GMT+03:30) Tehran');
    obj.addSelectOption('4_a', '(GMT+04:00) Abu Dhabi, Muscat');
    obj.addSelectOption('4_b', '(GMT+04:00) Baku');
    obj.addSelectOption('4_c', '(GMT+04:00) Caucasus Standard Time');
    obj.addSelectOption('4_d', '(GMT+04:00) Tbilisi');
    obj.addSelectOption('4.5_a', '(GMT+04:30) Kabul');
    obj.addSelectOption('5_a', '(GMT+05:00) Islamabad, Karachi');
    obj.addSelectOption('5_b', '(GMT+05:00) Ekaterinburg');
    obj.addSelectOption('5_c', '(GMT+05:00) Tashkent');
    obj.addSelectOption('5.5_a', '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
    obj.addSelectOption('5.75_a', '(GMT+05:45) Kathmandu');
    obj.addSelectOption('6_a', '(GMT+06:00) Novosibirsk');
    obj.addSelectOption('6_b', '(GMT+06:00) Astana, Dhaka');
    obj.addSelectOption('6.5_a', '(GMT+06:30) Yangon (Rangoon)');
    obj.addSelectOption('7_a', '(GMT+07:00) Bangkok, Hanoi, Jakarta');
    obj.addSelectOption('7_b', '(GMT+07:00) Krasnoyarsk');
    obj.addSelectOption('8_a', '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi');
    obj.addSelectOption('8_b', '(GMT+08:00) Kuala Lumpur, Singapore');
    obj.addSelectOption('8_c', '(GMT+08:00) Taipei');
    obj.addSelectOption('8_d', '(GMT+08:00) Perth');
    obj.addSelectOption('8_e', '(GMT+08:00) Irkutsk');
    obj.addSelectOption('8_f', '(GMT+08:00) Manila');
    obj.addSelectOption('9_a', '(GMT+09:00) Seoul');
    obj.addSelectOption('9_b', '(GMT+09:00) Osaka, Sapporo, Tokyo');
    obj.addSelectOption('9_c', '(GMT+09:00) Yakutsk');
    obj.addSelectOption('9.5_a', '(GMT+09:30) Darwin');
    obj.addSelectOption('9.5_b', '(GMT+09:30) Adelaide');
    obj.addSelectOption('10_a', '(GMT+10:00) Canberra, Melbourne, Sydney');
    obj.addSelectOption('10_b', '(GMT+10:00) Brisbane');
    obj.addSelectOption('10_c', '(GMT+10:00) Hobart');
    obj.addSelectOption('10_d', '(GMT+10:00) Guam, Port Moresby');
    obj.addSelectOption('10_e', '(GMT+10:00) Vladivostok');
    obj.addSelectOption('11_a', '(GMT+11:00) Magadan, Solomon Is., New Caledonia');
    obj.addSelectOption('12_a', '(GMT+12:00) Fiji, Marshall Is.');
    obj.addSelectOption('12_b', '(GMT+12:00) Auckland, Wellington');
    obj.addSelectOption('13_c', '(GMT+13:00) Nuku\&#39;alofa');
}

function AddTime(timeFormat, time, hours, minutes) {
    var timeArray = new Array();

    var hr = parseInt(time.substring(0, time.indexOf(':')));
    var mnt = parseInt(time.substring(time.indexOf(':') + 1, time.indexOf(' ')));
    var amPm = time.substring(time.length - 2, time.length);
    var newHr;
    var newMinutes;
    var minutesHours;

    if (amPm == 'am' && hr == 12) {
        hr = 0;
    }

    newHr = hr + hours;
    newMinutes = mnt + minutes;


    minutesHours = parseInt(newMinutes / 60);

    newMinutes = newMinutes - (minutesHours * 60);

    newHr = newHr + minutesHours;

    if (newHr >= 12 && hr != 12) {

        if (amPm == 'am') {
            amPm = 'pm';

        }
        else if (amPm = 'pm') {
            amPm = 'am';
        }

    }

    if (newHr > 12 && amPm == 'pm')
        newHr = newHr - 12;

    return newHr + ':' + addZeroes(String(newMinutes), 2) + ' ' + amPm;

}

function TimeDiff(timeFormat, time1, time2, diff) {
    var hrDiff;
    var mntDiff;
    var amPm;


    var hr1 = parseInt(time1.substring(0, time1.indexOf(':')));
    var mnt1 = parseInt(time1.substring(time1.indexOf(':') + 1, time1.indexOf(' ')));
    var amPm1 = time1.substring(time1.length - 2, time1.length);

    var hr2 = parseInt(time2.substring(0, time2.indexOf(':')));
    var mnt2 = parseInt(time2.substring(time2.indexOf(':') + 1, time2.indexOf(' ')));
    var amPm2 = time2.substring(time2.length - 2, time2.length);

    amPm = amPm1;

    if (amPm1 == 'pm' && hr1 < 12) {
        hr1 = hr1 + 12;
    }

    if (amPm2 == 'pm' && hr2 < 12) {
        hr2 = hr2 + 12;
    }

    if (amPm1 == 'am' && hr1 == 12) {
        hr1 = 0;
    }

    if (amPm2 == 'am' && hr2 == 12) {
        hr2 = 0;
    }


    hrDiff = hr2 - hr1;

    mntDiff = mnt2 - mnt1;

    if (mntDiff < 0) {
        hrDiff = hrDiff - 1;
        mntDiff = 60 + mntDiff;
    }


    if (diff == 'h') {

        //if (hr2>12 && hrDiff<=12) amPm='am';   // Will be use when we need time that what will be the time if we do time2-time1

        return hrDiff;
    }


    else if (diff == 'm')
        return (hrDiff * 60) + mntDiff;


}
