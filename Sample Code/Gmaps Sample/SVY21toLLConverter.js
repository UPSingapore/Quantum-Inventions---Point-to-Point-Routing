//
// Copyright: 2010 Dominic Chin, All Rights Reserved
//
//   Name    :   SVY21.js
//   Author  :   Dominic Chin
//   Email   :   dominicchinguard-web(at)yahoo.com
//   Date    :   Feb 22, 2010
//
//   Updates :
//               Feb 22, 2010 -   DC  -   Initial release
// src = SVY21.js
//   Modified by: Benedict
//	 Modified Date: June 6, 2012

var ELLIPSOID_SEMIMAJORAXIS = 6378137.0;
var ELLIPSOID_ECCENTRICITY = 0.0818191908426215;
var ELLIPSOID_FLATTENING = 0.00335281066474746;
var PROJ_NATURALORIGINLATITUDE = 1.36666666666667;
var PROJ_NATURALORIGINLONGITUDE = 103.833333333333;
var PROJ_SCALEFACTOR = 1.0;
var PROJ_FALSEEASTINGS = 28001.642;
var PROJ_FALSENORTHINGS = 38744.572;

function BulkCnvEN2LL() {
    var txtAreaEN = document.getElementById('txtAreaEN').value;
    var ENFormat, latLngFormat;
    var oTxtAreaLL = document.getElementById('txtAreaLL');
    var oCboENFormat = document.getElementById('cboENFormat');
    var oCboLLFormat = document.getElementById('cboLatLngFormat');
    var txtAreaLL, txtEast, txtNorth, txtLatLng;
    if (txtAreaEN == "") {
        return;
    }
    if (oCboENFormat) {
        ENFormat = oCboENFormat.value;
    }
    if (oCboLLFormat) {
        latLngFormat = oCboLLFormat.value;
    }
    oTxtAreaLL.value = '';
    var arrEN = txtAreaEN.split('\n');
    for (var i = 0; i < arrEN.length; i++) {
        var txtEN = arrEN[i];
        var arr;
        if (not_empty(txtEN)) {
            if (ENFormat == 1) {
                arr = txtEN.split('\t');
            } else if (ENFormat == 2) {
                arr = txtEN.split(' ');
            } else if (ENFormat == 3) {
                arr = txtEN.split(',');
            }
            if (arr.length > 0) {
                txtEast = arr[0];
                txtNorth = arr[1];
                txtLatLng = CnvEN2LL(txtEast, txtNorth, latLngFormat);
                oTxtAreaLL.value = oTxtAreaLL.value + txtLatLng + '\r\n';
            }
        }
    }
}

function BulkCnvLL2EN(lat, long) {
    
    var txtAreaLL = lat+","+long;
    var latLngFormat, ENFormat;

    var txtAreaEN;
    var arr, txtLat, txtLng, txtEN, txtLatD, txtLatM, txtLatS, txtLngD, txtLngM, txtLngS;
    
	ENFormat = 3;
    latLngFormat = 5;
    
    //oTxtAreaEN.value = '';
    var arrLL = txtAreaLL.split('\n');
    for (var i = 0; i < arrLL.length; i++) {
        var txtLL = arrLL[i];
        if (not_empty(txtLL)) {
            if (latLngFormat == 1) {
                arr = txtLL.split('\t');
                txtLatD = arr[0];
                txtLatM = arr[1];
                txtLatS = arr[2];
                txtLngD = arr[3];
                txtLngM = arr[4];
                txtLngS = arr[5];
                txtLat = CnvDMS2Deg(txtLatD, txtLatM, txtLatS);
                txtLng = CnvDMS2Deg(txtLngD, txtLngM, txtLngS);
            } else if (latLngFormat == 2) {
                arr = txtLL.split(' ');
                txtLatD = arr[0];
                txtLatM = arr[1];
                txtLatS = arr[2];
                txtLngD = arr[3];
                txtLngM = arr[4];
                txtLngS = arr[5];
                txtLat = CnvDMS2Deg(txtLatD, txtLatM, txtLatS);
                txtLng = CnvDMS2Deg(txtLngD, txtLngM, txtLngS);
            } else if (latLngFormat == 3) {
                arr = txtLL.split('\t');
                txtLat = arr[0];
                txtLng = arr[1];
            } else if (latLngFormat == 4) {
                arr = txtLL.split(' ');
                txtLat = arr[0];
                txtLng = arr[1];
            } else if (latLngFormat == 5) {
                arr = txtLL.split(',');
                txtLat = arr[0];
                txtLng = arr[1];
            }			
            txtEN = CnvLL2EN(txtLat, txtLng, ENFormat);
            return txtEN;
        };
    };
};

function not_empty(value) {
    var re = (value.replace(/^\s+|\s+$/g, '').length > 0) ? true : false;
    return re;
};

function CnvLL2EN(latDeg, lngDeg, ENFormat) {
    var ret, latRad, lngRad, A, T, C, M, v, M0, easting, northing, e2;
    e2 = SecondEccentricity();
    latRad = CnvDegToRad(latDeg);
    lngRad = CnvDegToRad(lngDeg);
    A = calc_A(latRad, lngRad);
    T = calc_T(latRad);
    C = calc_C(latRad);
    M = calc_M(latRad);
    v = calc_v(latRad);
    M0 = calc_M(CnvDegToRad(PROJ_NATURALORIGINLATITUDE));
    easting = A + ((1.0 - T + C) * Math.pow(A, 3) / 6.0) + (5.0 - 18.0 * T + T * T + 72.0 * C - 58.0 * Math.pow(e2, 2)) * Math.pow(A, 5) / 120.0;
    easting = PROJ_FALSEEASTINGS + PROJ_SCALEFACTOR * v * easting;
    northing = (A * A / 2.0) + ((5.0 - T + 9.0 * C + 4.0 * C * C) * Math.pow(A, 4) / 24.0) + ((61.0 - 58.0 * T + T * T + 600.0 * C - 330.0 * Math.pow(e2, 2)) * Math.pow(A, 6) / 720.0);
    northing = (PROJ_FALSENORTHINGS + PROJ_SCALEFACTOR * (M - M0 + v * Math.tan(latRad) * northing));
    if (ENFormat == 1) {
        ret = String(easting) + "\t" + String(northing);
    } else if (ENFormat == 2) {
        ret = String(easting) + ' ' + String(northing);
    } else if (ENFormat == 3) {
        ret = String(easting) + ',' + String(northing);
    }
    return ret;
}

function CnvEN2LL(easting, northing, latLngFormat) {
    var e1, M1, u1, lat1, T1, C1, v1, p1, D, latRad, lngRad, e2, lat, lon;
    var LatDD, LatMM, LatSS, LonDD, LonMM, LonSS, LL;
    e2 = SecondEccentricity();
    e1 = calc_e1();
    M1 = calc_M1(northing);
    u1 = calc_u1(M1);
    lat1 = calc_lat1(u1, e1);
    T1 = calc_T1(lat1);
    C1 = calc_c1(lat1);
    v1 = calc_v1(lat1);
    p1 = calc_p1(lat1);
    D = (easting - PROJ_FALSEEASTINGS) / (v1 * PROJ_SCALEFACTOR);
    latRad = (D * D / 2.0) - (5.0 + 3.0 * T1 + 10.0 * C1 - 4.0 * C1 * C1 - 9.0 * Math.pow(e2, 2)) * (Math.pow(D, 4) / 24.0) + (61.0 + 90.0 * T1 + 298.0 * C1 + 45.0 * T1 * T1 - 252.0 * Math.pow(e2, 2) - 3.0 * C1 * C1) * (Math.pow(D, 6) / 720.0);
    latRad = lat1 - v1 * Math.tan(lat1) * latRad / p1;
    lat = CnvRadToDeg(latRad);
    lngRad = (D - (1.0 + 2.0 * T1 + C1) * Math.pow(D, 3) / 6.0 + (5.0 - 2.0 * C1 + 28.0 * T1 - 3.0 * C1 * C1 + 8.0 * Math.pow(e2, 2) + 24.0 * T1 * T1) * Math.pow(D, 5) / 120.0) / Math.cos(lat1);
    lngRad = CnvDegToRad(PROJ_NATURALORIGINLONGITUDE) + lngRad;
    lon = CnvRadToDeg(lngRad);
    LatDD = Math.floor(lat);
    LatMM = Math.floor((lat - LatDD) * 60);
    LatSS = (Math.round((((lat - LatDD) - (LatMM / 60)) * 60 * 60) * 100) / 100);
    LonDD = Math.floor(lon);
    LonMM = Math.floor((lon - LonDD) * 60);
    LonSS = (Math.round((((lon - LonDD) - (LonMM / 60)) * 60 * 60) * 100) / 100);
    if (latLngFormat == 1) {
        LL = LatDD + '\t' + LatMM + '\t' + LatSS + '\t' + LonDD + '\t' + LonMM + '\t' + LonSS;
    } else if (latLngFormat == 2) {
        LL = LatDD + ' ' + LatMM + ' ' + LatSS + ' ' + LonDD + ' ' + LonMM + ' ' + LonSS;
    } else if (latLngFormat == 3) {
        LL = lat + 't' + lon;
    } else if (latLngFormat == 4) {
        LL = lat + ' ' + lon;
    } else if (latLngFormat == 5) {
        LL = lat + ',' + lon;
    }
    return LL;
}

function SecondEccentricity() {
    return (Math.sqrt(ELLIPSOID_ECCENTRICITY * ELLIPSOID_ECCENTRICITY / (1.0 - ELLIPSOID_ECCENTRICITY * ELLIPSOID_ECCENTRICITY)));
}

function CnvDeg2DMS(deg) {
    var D, M, S, value;
    D = Math.floor(deg);
    M = Math.floor((deg - D) * 60);
    S = Math.round((((deg - D) - (M / 60.0)) * 60.0 * 60.0) * 100.0) / 100.0;
    if (S == 60) {
        S = 0;
        M = M + 1;
    }
    if (M == 60) {
        M = 0;
        D = D + 1;
    }
    value = D + ":" + M + ":" + S;
    return value;
}

function CnvDMS2Deg(dd, mm, ss) {
    return (dd * 1.0) + (mm / 60.0) + (ss / 3600.0);
}

function CnvRadToDeg(rad) {
    return (180.0 * rad / Math.PI);
}

function CnvDegToRad(deg) {
    return (Math.PI * deg) / 180.0;
}

function calc_A(latRad, lngRad) {
    return (lngRad - CnvDegToRad(PROJ_NATURALORIGINLONGITUDE)) * Math.cos(latRad);
}

function calc_T(latRad) {
    return Math.tan(latRad) * Math.tan(latRad);
}

function calc_C(latRad) {
    var value;
    value = Math.cos(latRad) * Math.cos(latRad) * Math.pow(ELLIPSOID_ECCENTRICITY, 2.0);
    return value / (1.0 - Math.pow(ELLIPSOID_ECCENTRICITY, 2.0));
}

function calc_v(latRad) {
    var value;
    value = 1.0 - Math.pow(ELLIPSOID_ECCENTRICITY * Math.sin(latRad), 2.0);
    return ELLIPSOID_SEMIMAJORAXIS / Math.sqrt(value);
}

function calc_M(latRad) {
    var value, e, term1, term2, term3, term4;
    e = ELLIPSOID_ECCENTRICITY;
    term1 = 1.0 - (Math.pow(e, 2) / 4.0) - (3.0 * Math.pow(e, 4) / 64.0) - (5.0 * Math.pow(e, 6) / 256);
    term2 = (3.0 * Math.pow(e, 2) / 8.0) + (3.0 * Math.pow(e, 4) / 32.0) + (45.0 * Math.pow(e, 6) / 1024.0);
    term3 = (15.0 * Math.pow(e, 4.0) / 256.0) + (45.0 * Math.pow(e, 6) / 1024.0);
    term4 = (35.0 * Math.pow(e, 6) / 3072);
    value = term1 * latRad - term2 * Math.sin(2.0 * latRad) + term3 * Math.sin(4.0 * latRad) - term4 * Math.sin(6 * latRad);
    return value * ELLIPSOID_SEMIMAJORAXIS;
}

function calc_T1(lat1) {
    var value;
    value = Math.tan(lat1);
    return value * value;
}

function calc_v1(lat1) {
    var value;
    value = ELLIPSOID_ECCENTRICITY * Math.sin(lat1);
    value = Math.sqrt(1.0 - value * value);
    return ELLIPSOID_SEMIMAJORAXIS / value;
}

function calc_p1(lat1) {
    var value, e;
    e = ELLIPSOID_ECCENTRICITY;
    value = 1.0 - e * e * Math.pow(Math.sin(lat1), 2);
    value = Math.pow(value, 3.0 / 2.0);
    return ELLIPSOID_SEMIMAJORAXIS * (1.0 - e * e) / value;
}

function calc_c1(lat1) {
    var value, e2;
    e2 = SecondEccentricity();
    value = e2 * Math.cos(lat1);
    return value * value;
}

function calc_e1() {
    var value;
    value = 1.0 - Math.sqrt(1.0 - Math.pow(ELLIPSOID_ECCENTRICITY, 2));
    return value / (1.0 + Math.sqrt(1.0 - Math.pow(ELLIPSOID_ECCENTRICITY, 2)));
}

function calc_M1(north) {
    var value, M0;
    M0 = calc_M(CnvDegToRad(PROJ_NATURALORIGINLATITUDE));
    return (M0 + (north - PROJ_FALSENORTHINGS) / PROJ_SCALEFACTOR);
}

function calc_u1(M1) {
    var value, e;
    e = ELLIPSOID_ECCENTRICITY;
    value = ELLIPSOID_SEMIMAJORAXIS * (1.0 - (e * e / 4.0) - (3.0 * Math.pow(e, 4) / 64.0) - (5.0 * Math.pow(e, 6) / 256.0));
    return M1 / value;
}

function calc_lat1(u1, e1) {
    var value;
    value = u1 + ((3.0 * e1 / 2.0) - 27.0 * e1 * e1 / 32.0) * Math.sin(2.0 * u1);
    value = value + ((21.0 * e1 * e1 / 16.0) - 55.0 * Math.pow(e1, 4.0) / 32.0) * Math.sin(4.0 * u1);
    value = value + (151.0 * Math.pow(e1, 3) / 96.0) * Math.sin(6.0 * u1);
    value = value + (1097.0 * Math.pow(e1, 4) / 512.0) * Math.sin(8.0 * u1);
    return value;
}