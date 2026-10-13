window.__ADSB_SAMPLE_DATA__ = {
 "_sample": true,
 "_note": "SAMPLE DATA - entirely fake placeholder entries for page development. Not real ADs or SBs. Serial prefixes S1/S2/S3 and all serial ranges are FAKE test values, not Mooney serial breaks.",
 "last_updated": "2026-10-13",
 "models": [
  {
   "id": "m20j",
   "name": "M20J 201",
   "years": "1977-1998",
   "engines": [
    "lycoming-io-360-a3b6d"
   ]
  },
  {
   "id": "m20k-231",
   "name": "M20K 231",
   "years": "1979-1985",
   "engines": [
    "continental-tsio-360-gb",
    "continental-tsio-360-lb"
   ]
  },
  {
   "id": "m20v",
   "name": "M20V Acclaim Ultra",
   "years": "2016-2019",
   "engines": [
    "continental-tsio-550-g"
   ]
  }
 ],
 "engines": [
  {
   "id": "lycoming-io-360-a3b6d",
   "name": "Lycoming IO-360-A3B6D"
  },
  {
   "id": "continental-tsio-360-gb",
   "name": "Continental TSIO-360-GB"
  },
  {
   "id": "continental-tsio-360-lb",
   "name": "Continental TSIO-360-LB"
  },
  {
   "id": "continental-tsio-550-g",
   "name": "Continental TSIO-550-G"
  }
 ],
 "items": [
  {
   "type": "AD",
   "number": "SAMPLE-0001",
   "title": "SAMPLE DATA – not real (airframe AD placeholder)",
   "applies_to": {
    "models": [
     "m20j",
     "m20k-231"
    ],
    "engines": [],
    "serials_status": "ranges",
    "serials": [
     {
      "model": "m20j",
      "from": "S1-0001",
      "to": "S1-0500",
      "exclude": [],
      "note": "SAMPLE applicability text: M20J serials S1-0001 through S1-0500"
     },
     {
      "model": "m20k-231",
      "from": "S2-0001",
      "to": null,
      "exclude": [],
      "note": "SAMPLE applicability text: M20K S2-0001 and on"
     }
    ]
   },
   "url": "https://drs.faa.gov/",
   "source": "SAMPLE – FAA DRS placeholder",
   "status": "active",
   "date": "2026-01-15"
  },
  {
   "type": "AD",
   "number": "SAMPLE-0002",
   "title": "SAMPLE DATA – not real (engine AD placeholder)",
   "applies_to": {
    "models": [],
    "engines": [
     "lycoming-io-360-a3b6d"
    ]
   },
   "url": "https://drs.faa.gov/",
   "source": "SAMPLE – FAA DRS placeholder",
   "status": "active",
   "date": "2025-06-02"
  },
  {
   "type": "AD",
   "number": "SAMPLE-0003",
   "title": "SAMPLE DATA – not real (superseded AD placeholder)",
   "applies_to": {
    "models": [
     "m20j"
    ],
    "engines": [],
    "serials_status": "ranges",
    "serials": [
     {
      "model": "m20j",
      "from": "S1-0501",
      "to": null,
      "exclude": [],
      "note": "SAMPLE applicability text: S1-0501 and on"
     }
    ]
   },
   "url": "https://drs.faa.gov/",
   "source": "SAMPLE – FAA DRS placeholder",
   "status": "superseded",
   "date": "2019-03-10"
  },
  {
   "type": "AD",
   "number": "SAMPLE-0004",
   "title": "SAMPLE DATA – not real (engine AD placeholder)",
   "applies_to": {
    "models": [],
    "engines": [
     "continental-tsio-360-gb",
     "continental-tsio-550-g"
    ]
   },
   "url": "https://drs.faa.gov/",
   "source": "SAMPLE – FAA DRS placeholder",
   "status": "active",
   "date": "2024-11-20"
  },
  {
   "type": "SB",
   "number": "SAMPLE-0101",
   "title": "SAMPLE DATA – not real (service bulletin placeholder)",
   "applies_to": {
    "models": [
     "m20j",
     "m20k-231",
     "m20v"
    ],
    "engines": [],
    "serials_status": "all"
   },
   "url": "https://www.mooney.com/",
   "source": "SAMPLE – Mooney placeholder",
   "status": "active",
   "date": "2023-08-01"
  },
  {
   "type": "SB",
   "number": "SAMPLE-0102",
   "title": "SAMPLE DATA – not real (superseded SB placeholder)",
   "applies_to": {
    "models": [
     "m20v"
    ],
    "engines": [],
    "serials_status": "ranges",
    "serials": [
     {
      "model": "m20v",
      "from": null,
      "to": "S2-0300",
      "exclude": [],
      "note": "SAMPLE applicability text: M20V S2-0300 and earlier"
     }
    ]
   },
   "url": "https://www.mooney.com/",
   "source": "SAMPLE – Mooney placeholder",
   "status": "superseded",
   "date": "2018-02-14"
  },
  {
   "type": "SI",
   "number": "SAMPLE-0201",
   "title": "SAMPLE DATA – not real (service instruction placeholder)",
   "applies_to": {
    "models": [
     "m20k-231"
    ],
    "engines": [],
    "serials_status": "unknown"
   },
   "url": "https://sample.invalid/not-a-real-link",
   "source": "SAMPLE – deliberately broken link to test the checker",
   "status": "active",
   "date": "2022-05-05"
  },
  {
   "type": "AD",
   "number": "SAMPLE-0005",
   "title": "SAMPLE DATA – not real (AD with an archived copy, serial range S1-0001 to S1-0099)",
   "applies_to": {
    "models": [
     "m20j"
    ],
    "engines": [],
    "serials_status": "ranges",
    "serials": [
     {
      "model": "m20j",
      "from": "S1-0001",
      "to": "S1-0099",
      "exclude": [
       "S1-0050"
      ],
      "note": "SAMPLE applicability text: S1-0001 through S1-0099 except S1-0050"
     }
    ]
   },
   "url": "https://drs.faa.gov/",
   "archive_url": "https://web.archive.org/web/2026/https://drs.faa.gov/",
   "source": "SAMPLE – FAA DRS placeholder",
   "status": "active",
   "date": "2026-02-01",
   "archived_copy": true,
   "note": "SAMPLE note field: shown under the title"
  }
 ],
 "serial_prefixes": [
  {
   "prefix": "S1",
   "model": "m20j",
   "from": "S1-0001",
   "to": "S1-0999",
   "source": "SAMPLE",
   "note": "FAKE sample - not a real Mooney serial break"
  },
  {
   "prefix": "S1",
   "model": "m20v",
   "from": "S1-1000",
   "to": null,
   "source": "SAMPLE",
   "note": "FAKE sample - not a real Mooney serial break (same prefix, different model by range)"
  },
  {
   "prefix": "S2",
   "model": "m20k-231",
   "from": "S2-0001",
   "to": "S2-0500",
   "source": "SAMPLE",
   "note": "FAKE sample - not a real Mooney serial break"
  },
  {
   "prefix": "S2",
   "model": "m20v",
   "from": "S2-0001",
   "to": "S2-0500",
   "source": "SAMPLE",
   "note": "FAKE sample - not a real Mooney serial break (deliberate overlap to test the chooser)"
  }
 ]
};
