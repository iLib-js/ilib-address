/*
 * testaddressasync.js - test the address parsing and formatting routines asynchronously
 *
 * Copyright © 2015, 2017-2018, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LocaleData } from 'ilib-localedata';
import { getPlatform } from 'ilib-env';

import Address from '../src/Address.js';
import AddressFmt from '../src/AddressFmt.js';

let setUpPerformed = false;

function searchRegions(array, regionCode) {
    return array.find(function(region) {
        return region.code === regionCode;
    });
}

export const testaddressasync = {
    testParseAddressAsyncSimple: function(test) {
        test.expect(7);
        Address.create("950 W Maude Ave.\nSunnyvale, CA 94085\nUSA", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "950 W Maude Ave.");
            test.equal(parsedAddress.locality, "Sunnyvale");
            test.equal(parsedAddress.region, "CA");
            test.equal(parsedAddress.postalCode, "94085");
            test.equal(parsedAddress.country, "USA");
            test.equal(parsedAddress.countryCode, "US");
            test.done();
        });
    },

    // to verify NOV-111026
    testParseAddressAsyncSimple2: function(test) {
        test.expect(7);
        Address.create("20 Main St.\nMyTown, NY 11530\nUSA", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "20 Main St.");
            test.equal(parsedAddress.locality, "MyTown");
            test.equal(parsedAddress.region, "NY");
            test.equal(parsedAddress.postalCode, "11530");
            test.equal(parsedAddress.country, "USA");
            test.equal(parsedAddress.countryCode, "US");
            test.done();
        });
    },

    testParseAddressAsyncSimple3: function(test) {
        test.expect(7);
        Address.create("5-2-1 Ginza, Chuo-ku\nTokyo 170-3293\nJapan", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "5-2-1 Ginza");
            test.equal(parsedAddress.locality, "Chuo-ku");
            test.equal(parsedAddress.region, "Tokyo");
            test.equal(parsedAddress.postalCode, "170-3293");
            test.equal(parsedAddress.country, "Japan");
            test.equal(parsedAddress.countryCode, "JP");
            test.done();
        });
    },

    testParseAddressAsyncMoreComplex: function(test) {
        test.expect(7);
        Address.create("950 W 21st Ave, Apt 45\nNY, NY 10234", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "950 W 21st Ave, Apt 45");
            test.equal(parsedAddress.locality, "NY");
            test.equal(parsedAddress.region, "NY");
            test.equal(parsedAddress.postalCode, "10234");
            test.ok(typeof(parsedAddress.country) === "undefined");
            test.equal(parsedAddress.countryCode, "US");
            test.done();
        });
    },

    testParseAddressAsyncSpelledOutState: function(test) {
        test.expect(7);
        Address.create("20 Main St.\nMyTown, Arizona 11530\nUSA", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "20 Main St.");
            test.equal(parsedAddress.locality, "MyTown");
            test.equal(parsedAddress.region, "Arizona");
            test.equal(parsedAddress.postalCode, "11530");
            test.equal(parsedAddress.country, "USA");
            test.equal(parsedAddress.countryCode, "US");
            test.done();
        });
    },

    testParseAddressAsyncSpelledOutStateWithSpaces: function(test) {
        test.expect(7);
        Address.create("20 Main St.\nMyTown, New York 11530\nUSA", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "20 Main St.");
            test.equal(parsedAddress.locality, "MyTown");
            test.equal(parsedAddress.region, "New York");
            test.equal(parsedAddress.postalCode, "11530");
            test.equal(parsedAddress.country, "USA");
            test.equal(parsedAddress.countryCode, "US");
            test.done();
        });
    },

    testParseAddressAsyncUnknown: function(test) {
        test.expect(7);

        Address.create("123 Main Street, Pretoria 5678, South Africa", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "123 Main Street");
            test.equal(parsedAddress.locality, "Pretoria");
            test.ok(typeof(parsedAddress.region) === "undefined");
            test.equal(parsedAddress.postalCode, "5678");
            test.equal(parsedAddress.country, "South Africa");
            test.equal(parsedAddress.countryCode, "ZA");
            test.done();
        });
    },

    testParseAddressAsyncNonUS: function(test) {
        test.expect(7);
        Address.create("Achterberglaan 23, 2345 GD Uithoorn, Netherlands", { locale: 'en-US' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "Achterberglaan 23");
            test.equal(parsedAddress.locality, "Uithoorn");
            test.ok(typeof(parsedAddress.region) === "undefined");
            test.equal(parsedAddress.postalCode, "2345 GD");
            test.equal(parsedAddress.country, "Netherlands");
            test.equal(parsedAddress.countryCode, "NL");
            test.done();
        });
    },

    testFormatAddressAsyncUS: function(test) {
        test.expect(2);
        Address.create({
            streetAddress: "1234 Any Street",
            locality: "Anytown",
            region: "CA",
            postalCode: "94085",
            country: "United States of America",
            countryCode: "US"
        }, {locale: 'en-US'}).then(pa => {
            var expected = "1234 Any Street\nAnytown CA 94085\nUnited States of America";
            AddressFmt.create({ locale: 'en-US' }).then(formatter => {
                test.ok(typeof(formatter) !== "undefined");
                test.equal(formatter.format(pa), expected);
                test.done();
            });
        });
    },

    testFormatAddressAsyncUnknownLocaleQQ: function(test) {
        test.expect(2);
        Address.create({
            streetAddress: "123 mcdonald ave, apt 234",
            locality: "Sunnyvale",
            region: "CA",
            postalCode: "94086",
            locale: 'en-QQ'
        }).then(pa => {
            // should return the "root" information
            var expected = "123 mcdonald ave, apt 234\nSunnyvale CA 94086";
            AddressFmt.create({
                locale: 'en-QQ',
                style: 'nocountry',
            }).then(formatter => {
                test.ok(typeof(formatter) !== "undefined");
                test.equal(formatter.format(pa), expected);
                test.done();
            });
        });
    },

    testParseAddressAsyncJPAsianNormal1: function(test) {
        test.expect(6);
        Address.create("〒150-2345 東京都渋谷区本町2丁目4-7サニーマンション203", { locale: 'ja-JP' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "本町2丁目4-7サニーマンション203");
            test.equal(parsedAddress.locality, "渋谷区");
            test.equal(parsedAddress.region, "東京都");
            test.equal(parsedAddress.postalCode, "〒150-2345");
            test.equal(parsedAddress.countryCode, "JP");
            test.done();
        });
    },

    testFormatAddressAsyncJPAsianNormal: function(test) {
        test.expect(2);
        Address.create({
            streetAddress: "本町2丁目4-7サニーマンション203",
            locality: "渋谷区",
            region: "東京都",
            postalCode: "〒150-2345",
            countryCode: "JP",
            format: "asian"
        }, {locale: 'ja-JP'}).then(parsedAddress => {
            var expected = "〒150-2345\n東京都渋谷区本町2丁目4-7サニーマンション203";

            AddressFmt.create({
                locale: 'ja-JP',
            }).then(formatter => {
                test.ok(typeof(formatter) !== "undefined");
                test.equal(formatter.format(parsedAddress), expected);
                test.done();
            });
        });
    },


    testParseAddressAsyncCNAsianNormal: function(test) {
        test.expect(7);
        Address.create("中国北京市朝阳区建国路112号 中国惠普大厦100022", { locale: 'zh-CN' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "建国路112号 中国惠普大厦");
            test.equal(parsedAddress.locality, "朝阳区");
            test.equal(parsedAddress.region, "北京市");
            test.equal(parsedAddress.postalCode, "100022");
            test.equal(parsedAddress.country, "中国");
            test.equal(parsedAddress.countryCode, "CN");
            test.done();
        });
    },

    testParseAddressAsyncDENormal: function(test) {
        test.expect(7);
        Address.create("Herrenberger Straße 140, 71034 Böblingen, Deutschland", { locale: 'de-DE' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "Herrenberger Straße 140");
            test.equal(parsedAddress.locality, "Böblingen");
            test.ok(typeof(parsedAddress.region) === "undefined");
            test.equal(parsedAddress.postalCode, "71034");
            test.equal(parsedAddress.country, "Deutschland");
            test.equal(parsedAddress.countryCode, "DE");
            test.done();
        });
    },

    testParseAddressAsyncTHNormal: function(test) {
        test.expect(7);
        Address.create("49 ซอยร่วมฤดี, ถนนเพลินจิต, ลุมพินี\nเขตปทุมวัน กรุงเทพฯ 10330\nประเทศไทย", { locale: 'th-TH' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "49 ซอยร่วมฤดี, ถนนเพลินจิต, ลุมพินี");
            test.equal(parsedAddress.locality, "เขตปทุมวัน");
            test.equal(parsedAddress.region, "กรุงเทพฯ");
            test.equal(parsedAddress.postalCode, "10330");
            test.equal(parsedAddress.country, "ประเทศไทย");
            test.equal(parsedAddress.countryCode, "TH");
            test.done();
        });
    },

    testParseAddressAsyncRUNormal: function(test) {
        test.expect(7);
        Address.create("Петров Иван Сергеевич ул. Лесная D. 5 поз. Лесной\nАЛЕКСЕЕВСКИЙ R-N\nВоронежская область\nРоссия\n247112", { locale: 'ru-RU' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "Петров Иван Сергеевич ул. Лесная D. 5 поз. Лесной");
            test.equal(parsedAddress.locality, "АЛЕКСЕЕВСКИЙ R-N");
            test.equal(parsedAddress.region, "Воронежская область");
            test.equal(parsedAddress.postalCode, "247112");
            test.equal(parsedAddress.country, "Россия");
            test.equal(parsedAddress.countryCode, "RU");
            test.done();
        });
    },

    testParseAddressAsyncSANormalNative: function(test) {
        test.expect(7);
        Address.create("السيد عبد الله ناصر\nمكة المكرمة ٢١۴۵۴\nالمملكة العربية السعودية", { locale: 'ar-SA' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "السيد عبد الله ناصر");
            test.equal(parsedAddress.locality, "مكة المكرمة");
            test.ok(typeof(parsedAddress.region) === "undefined");
            test.equal(parsedAddress.postalCode, "٢١۴۵۴");
            test.equal(parsedAddress.country, "المملكة العربية السعودية");
            test.equal(parsedAddress.countryCode, "SA");
            test.done();
        });
    },

    testParseAddressAsyncINHINormal: function(test) {
        test.expect(7);
        Address.create("१२५/१, एजी टावर्स. ३ तल, पार्क स्ट्रीट. सर्कस एवेन्यू\nकोलकाता\nपश्चिम बंगाल\n७०००१७\nभारत", { locale: 'hi-IN' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "१२५/१, एजी टावर्स. ३ तल, पार्क स्ट्रीट. सर्कस एवेन्यू");
            test.equal(parsedAddress.locality, "कोलकाता");
            test.equal(parsedAddress.region, "पश्चिम बंगाल");
            test.equal(parsedAddress.postalCode, "७०००१७");
            test.equal(parsedAddress.country, "भारत");
            test.equal(parsedAddress.countryCode, "IN");
            test.done();
        });
    },

    testParseAddressAsyncINGUNoZip: function(test) {
        test.expect(7);
        Address.create("125/1, એજી ટાવર્સ. 3 જો માળ, પાર્ક સ્ટ્રીટ. સર્કસ એવન્યુ\nકોલકાતા\nપશ્ચિમ બંગાળ\nભારત", { locale: 'gu-IN' }).then(parsedAddress => {
            test.ok(typeof(parsedAddress) !== "undefined");
            test.equal(parsedAddress.streetAddress, "125/1, એજી ટાવર્સ. 3 જો માળ, પાર્ક સ્ટ્રીટ. સર્કસ એવન્યુ");
            test.equal(parsedAddress.locality, "કોલકાતા");
            test.equal(parsedAddress.region, "પશ્ચિમ બંગાળ");
            test.equal(parsedAddress.country, "ભારત");
            test.equal(parsedAddress.countryCode, "IN");
            test.ok(typeof(parsedAddress.postalCode) === "undefined");
            test.done();
        });
    },

    testFormatAddressUnknownCountry: function(test) {
        test.expect(1);
        Address.create({
            streetAddress: "1234 Any Street",
            locality: "Anytown",
            region: "CA",
            postalCode: "94085",
            country: "Unknown",
            countryCode: "XY"
        }, {locale: 'en-XY'}).then(parsedAddress => {
            var expected = "1234 Any Street\nAnytown CA 94085\nUnknown";
            AddressFmt.create({
                locale: 'en-XY',
                style: 'nocountry',
            }).then(formatter => {
                test.equal(formatter.format(parsedAddress), expected);
                test.done();
            });
        });
    },

    testAddressFmtGetFormatInfoUSRightConstraints: function(test) {
        test.expect(19);
        AddressFmt.create({ locale: 'en-US' }).then(formatter => {
            formatter.getFormatInfo(undefined, false).then(info => {
                test.ok(info);

                test.equal(info[1][2].component, "postalCode");
                test.equal(info[1][2].constraint, "[0-9]{5}(-[0-9]{4})?");

                test.equal(info[1][1].component, "region");
                test.ok(info[1][1].constraint);
                var r = searchRegions(info[1][1].constraint, "AZ");
                test.equal(r.code, "AZ");
                test.equal(r.name, "Arizona");
                r = searchRegions(info[1][1].constraint, "MS");
                test.equal(r.code, "MS");
                test.equal(r.name, "Mississippi");
                r = searchRegions(info[1][1].constraint, "NY");
                test.equal(r.code, "NY");
                test.equal(r.name, "New York");

                test.equal(info[2][0].component, "country");
                test.ok(info[2][0].constraint);
                var r = searchRegions(info[2][0].constraint, "JP");
                test.equal(r.code, "JP");
                test.equal(r.name, "Japan");
                r = searchRegions(info[2][0].constraint, "CR");
                test.equal(r.code, "CR");
                test.equal(r.name, "Costa Rica");
                r = searchRegions(info[2][0].constraint, "ZA");
                test.equal(r.code, "ZA");
                test.equal(r.name, "South Africa");

                test.done();
            });
        });
    },

    testAddressFmtGetFormatInfoUnknownCountry: function(test) {
        test.expect(7);
        AddressFmt.create({ locale: 'en-XY' }).then(formatter => {
            formatter.getFormatInfo(undefined, false).then(info => {
                test.ok(info);

                // test for generic data
                test.equal(info[1][0].component, "locality");
                test.equal(info[1][0].constraint, "([A-zÀÁÈÉÌÍÑÒÓÙÚÜàáèéìíñòóùúü\\.\\-\\']+\\s*){1,2}$");

                test.equal(info[1][1].component, "region");
                test.equal(info[1][1].constraint, "([A-zÀÁÈÉÌÍÑÒÓÙÚÜàáèéìíñòóùúü\\.\\-\\']+\\s*){1,2}$");

                test.equal(info[1][2].component, "postalCode");
                test.equal(info[1][2].constraint, "[0-9]+");

                test.done();
            });
        });
    }
};
