/**
 * Comprehensive Geographic Hierarchy for SwachhLens
 * Country (India) -> 28 States & 8 Union Territories -> 5 Major Districts Each -> 5 Major Real Wards Each
 *
 * Fully covers:
 * - All 28 States of India
 * - All 8 Union Territories of India
 * - Greater Chennai Corporation (GCC) Wards 1 to 200 (Zones 1 to 15)
 */

export interface WardOption {
  id: string;
  name: string; // Authoritative format: "Ward N – Area Name"
  zone?: string;
}

export interface DistrictData {
  id: string;
  name: string;
  wards: WardOption[];
}

export interface StateData {
  id: string;
  name: string;
  districts: DistrictData[];
}

export interface CountryData {
  id: string;
  name: string;
  code: string;
  states: StateData[];
}

// Helper to generate GCC Wards 1 to 200 with official Chennai Zones and Localities
const generateChennaiWards = (): WardOption[] => {
  const gccZones: { zone: string; start: number; end: number; localities: string[] }[] = [
    {
      zone: 'Zone 1 – Thiruvottiyur',
      start: 1,
      end: 14,
      localities: [
        'Thiruvottiyur North', 'Wimco Nagar', 'Ernavoor', 'Kathivakkam', 'Thiruvottiyur Central',
        'Tollgate', 'Kaladipet', 'Sathangadu East', 'Rajaji Nagar', 'Theradi',
        'Appar Samy Garden', 'Thiruvottiyur West', 'Manali Road', 'Sathangadu'
      ]
    },
    {
      zone: 'Zone 2 – Manali',
      start: 15,
      end: 21,
      localities: [
        'Manali East', 'Manali Town', 'Chinna Sekkadu', 'Manali West',
        'Mathur MMDA', 'Madhavaram Milk Colony Extn', 'Kosapur'
      ]
    },
    {
      zone: 'Zone 3 – Madhavaram',
      start: 22,
      end: 33,
      localities: [
        'Puzhal North', 'Puzhal Central', 'Madhavaram North', 'Vadaperumbakkam',
        'Surapet', 'Puthagaram', 'Kathirvedu', 'Vinayagapuram',
        'Madhavaram South', 'Madhavaram Central', 'Retteri', 'Kolathur North'
      ]
    },
    {
      zone: 'Zone 4 – Tondiarpet',
      start: 34,
      end: 48,
      localities: [
        'Korukkupet North', 'Korukkupet South', 'Stanley Hospital Area', 'Meenambal Nagar',
        'Dr. Radhakrishnan Nagar North', 'Dr. Radhakrishnan Nagar South', 'Tondiarpet High Road', 'Vaidyanathan Street',
        'Tondiarpet Market', 'Washermanpet North', 'Washermanpet East', 'Washermanpet West',
        'Old Washermanpet', 'Cemetery Road', 'Kasimedu'
      ]
    },
    {
      zone: 'Zone 5 – Royapuram',
      start: 49,
      end: 63,
      localities: [
        'Royapuram Pier', 'Royapuram Market', 'Singara Garden', 'Sanjeevirayanpet',
        'Mottai Thottam', 'Moolakothalam', 'Seven Wells North', 'Seven Wells South',
        'Sowcarpet North', 'Sowcarpet South', 'Peddanaickenpet', 'George Town',
        'Park Town / Central', 'Chintadripet', 'Periamet'
      ]
    },
    {
      zone: 'Zone 6 – Thiru Vi Ka Nagar',
      start: 64,
      end: 78,
      localities: [
        'Kolathur East', 'Kolathur Central', 'Periyar Nagar', 'Jawahar Nagar',
        'Sembium', 'Siruvallur', 'Perambur North', 'Perambur Central',
        'Perambur South', 'Thiru Vi Ka Nagar', 'Pulianthope North', 'Pulianthope Central',
        'Dr. Ambedkar Nagar', 'Pattalam', 'Otteri'
      ]
    },
    {
      zone: 'Zone 7 – Ambattur',
      start: 79,
      end: 93,
      localities: [
        'Oragadam Ambattur', 'Padi North', 'Korattur North', 'Korattur South',
        'Mannurpet', 'Padi South', 'Ambattur Old Town', 'Venkatapuram',
        'Vijayalakshmipuram', 'Ramapuram Ambattur', 'Pudur', 'Menambedu',
        'Surapet Ambattur', 'Kallikuppam', 'Mogappair East'
      ]
    },
    {
      zone: 'Zone 8 – Anna Nagar',
      start: 94,
      end: 108,
      localities: [
        'Padikuppam', 'Mogappair West', 'Anna Nagar West Extension', 'Padi Pudur',
        'Anna Nagar West', 'Anna Nagar Tower Area', 'Villivakkam East', 'Villivakkam West',
        'Ayanavaram North', 'Ayanavaram South', 'Shenoy Nagar', 'Aminjikarai North',
        'Aminjikarai South', 'Kilpauk West', 'Kilpauk Garden'
      ]
    },
    {
      zone: 'Zone 9 – Teynampet',
      start: 110,
      end: 126,
      localities: [
        'Nungambakkam High Road', 'Nungambakkam West', 'Thousand Lights West', 'Thousand Lights East',
        'Gopalapuram', 'Royapettah', 'Triplicane High Road', 'Chepauk',
        'Ice House / Marina', 'Alwarpet North', 'Teynampet North', 'Teynampet South',
        'Alwarpet South', 'CIT Nagar', 'Nandanam', 'T. Nagar North', 'T. Nagar Panagal Park'
      ]
    },
    {
      zone: 'Zone 10 – Kodambakkam',
      start: 127,
      end: 142,
      localities: [
        'Vadapalani North', 'Vadapalani Temple Area', 'Saligramam North', 'Saligramam South',
        'Ashok Nagar North', 'Ashok Nagar Pillar', 'MGR Nagar', 'KK Nagar West',
        'KK Nagar Central', 'KK Nagar South', 'Virugambakkam North', 'Virugambakkam South',
        'Alwarthirunagar', 'Valasaravakkam North', 'Valasaravakkam Central', 'Kodambakkam Station Area'
      ]
    },
    {
      zone: 'Zone 11 – Valasaravakkam',
      start: 143,
      end: 155,
      localities: [
        'Maduravoyal North', 'Maduravoyal South', 'Nerkundram East', 'Nerkundram West',
        'Kattupakkam', 'Porur North', 'Porur Junction', 'Karambakkam',
        'Ramapuram North', 'Ramapuram South', 'Manapakkam', 'Mugalivakkam North', 'Mugalivakkam South'
      ]
    },
    {
      zone: 'Zone 12 – Alandur',
      start: 156,
      end: 167,
      localities: [
        'Nanganallur North', 'Nanganallur South', 'Thillaiganga Nagar', 'Pazhavanthangal',
        'Adambakkam North', 'Adambakkam South', 'Alandur Court Area', 'St. Thomas Mount North',
        'Guindy Industrial Estate', 'Meenambakkam Airport Area', 'Thirusulam Road', 'Moovarasampettai'
      ]
    },
    {
      zone: 'Zone 13 – Adyar',
      start: 168,
      end: 181,
      localities: [
        'Guindy South', 'Saidapet West', 'Saidapet South', 'Kotturpuram',
        'Gandhi Nagar Adyar', 'Kasturba Nagar', 'Besant Nagar Beach', 'Besant Nagar Church Area',
        'Adyar Depo Area', 'Thiruvanmiyur North', 'Thiruvanmiyur Beach', 'Valmiki Nagar',
        'Indira Nagar', 'Adyar Signal Area'
      ]
    },
    {
      zone: 'Zone 14 – Perungudi',
      start: 182,
      end: 191,
      localities: [
        'Perungudi Toll Area', 'Kandanchavadi OMR', 'Seevaram', 'Thoraipakkam North',
        'Thoraipakkam Central', 'Palavakkam Beach', 'Palavakkam East', 'Kottivakkam ECR',
        'Kottivakkam Beach', 'Perungudi Lake Area'
      ]
    },
    {
      zone: 'Zone 15 – Sholinganallur',
      start: 192,
      end: 200,
      localities: [
        'Neelankarai Beach Area', 'Neelankarai ECR', 'Injambakkam', 'Akkarai / Panaiyur',
        'Karapakkam OMR', 'Sholinganallur Junction', 'Sholinganallur SEZ Area', 'Uthandi ECR', 'Semmancheri'
      ]
    }
  ];

  const wards: WardOption[] = [];
  for (const group of gccZones) {
    let locIdx = 0;
    for (let wardNum = group.start; wardNum <= group.end; wardNum++) {
      const locality = group.localities[locIdx] || `Area ${wardNum}`;
      wards.push({
        id: `chennai-ward-${wardNum}`,
        name: `Ward ${wardNum} – ${locality}`,
        zone: group.zone
      });
      locIdx++;
    }
  }
  return wards;
};

export const LOCATION_DATA: CountryData = {
  id: 'india',
  name: 'India',
  code: 'IN',
  states: [
  {
    "id": "andhra-pradesh",
    "name": "Andhra Pradesh",
    "districts": [
      {
        "id": "visakhapatnam",
        "name": "Visakhapatnam",
        "wards": [
          {
            "id": "vskp-1",
            "name": "Ward 1 \u2013 Gajuwaka"
          },
          {
            "id": "vskp-2",
            "name": "Ward 2 \u2013 MVP Colony"
          },
          {
            "id": "vskp-3",
            "name": "Ward 3 \u2013 Madhurawada"
          },
          {
            "id": "vskp-4",
            "name": "Ward 4 \u2013 Seethammadhara"
          },
          {
            "id": "vskp-5",
            "name": "Ward 5 \u2013 Jagadamba Junction"
          }
        ]
      },
      {
        "id": "vijayawada",
        "name": "Vijayawada (NTR District)",
        "wards": [
          {
            "id": "vja-1",
            "name": "Ward 1 \u2013 Benz Circle"
          },
          {
            "id": "vja-2",
            "name": "Ward 2 \u2013 Governorpet"
          },
          {
            "id": "vja-3",
            "name": "Ward 3 \u2013 Satyanarayanapuram"
          },
          {
            "id": "vja-4",
            "name": "Ward 4 \u2013 Bhavanipuram"
          },
          {
            "id": "vja-5",
            "name": "Ward 5 \u2013 Patamata"
          }
        ]
      },
      {
        "id": "guntur",
        "name": "Guntur",
        "wards": [
          {
            "id": "gtr-1",
            "name": "Ward 1 \u2013 Brodipet"
          },
          {
            "id": "gtr-2",
            "name": "Ward 2 \u2013 Arundelpet"
          },
          {
            "id": "gtr-3",
            "name": "Ward 3 \u2013 Pattabhipuram"
          },
          {
            "id": "gtr-4",
            "name": "Ward 4 \u2013 Gujjanagundla"
          },
          {
            "id": "gtr-5",
            "name": "Ward 5 \u2013 Kothapet"
          }
        ]
      },
      {
        "id": "tirupati",
        "name": "Tirupati",
        "wards": [
          {
            "id": "tpt-1",
            "name": "Ward 1 \u2013 Alipiri"
          },
          {
            "id": "tpt-2",
            "name": "Ward 2 \u2013 Balaji Colony"
          },
          {
            "id": "tpt-3",
            "name": "Ward 3 \u2013 Korlagunta"
          },
          {
            "id": "tpt-4",
            "name": "Ward 4 \u2013 Bairagipatteda"
          },
          {
            "id": "tpt-5",
            "name": "Ward 5 \u2013 Renigunta Road"
          }
        ]
      },
      {
        "id": "kurnool",
        "name": "Kurnool",
        "wards": [
          {
            "id": "knl-1",
            "name": "Ward 1 \u2013 Nandyal Check Post"
          },
          {
            "id": "knl-2",
            "name": "Ward 2 \u2013 Birla Gate"
          },
          {
            "id": "knl-3",
            "name": "Ward 3 \u2013 C-Camp"
          },
          {
            "id": "knl-4",
            "name": "Ward 4 \u2013 Budhawarapet"
          },
          {
            "id": "knl-5",
            "name": "Ward 5 \u2013 Old Town"
          }
        ]
      }
    ]
  },
  {
    "id": "arunachal-pradesh",
    "name": "Arunachal Pradesh",
    "districts": [
      {
        "id": "papum-pare",
        "name": "Papum Pare (Itanagar)",
        "wards": [
          {
            "id": "ita-1",
            "name": "Ward 1 \u2013 Ganga Sector"
          },
          {
            "id": "ita-2",
            "name": "Ward 2 \u2013 Bank Tinali"
          },
          {
            "id": "ita-3",
            "name": "Ward 3 \u2013 Zero Point"
          },
          {
            "id": "ita-4",
            "name": "Ward 4 \u2013 Chandranagar"
          },
          {
            "id": "ita-5",
            "name": "Ward 5 \u2013 Niti Vihar"
          }
        ]
      },
      {
        "id": "east-siang",
        "name": "East Siang (Pasighat)",
        "wards": [
          {
            "id": "pas-1",
            "name": "Ward 1 \u2013 High Ground"
          },
          {
            "id": "pas-2",
            "name": "Ward 2 \u2013 Market Area"
          },
          {
            "id": "pas-3",
            "name": "Ward 3 \u2013 Mirku"
          },
          {
            "id": "pas-4",
            "name": "Ward 4 \u2013 Banskota"
          },
          {
            "id": "pas-5",
            "name": "Ward 5 \u2013 Balek"
          }
        ]
      },
      {
        "id": "tawang",
        "name": "Tawang",
        "wards": [
          {
            "id": "taw-1",
            "name": "Ward 1 \u2013 Old Market"
          },
          {
            "id": "taw-2",
            "name": "Ward 2 \u2013 Monastery Road"
          },
          {
            "id": "taw-3",
            "name": "Ward 3 \u2013 Nehru Market"
          },
          {
            "id": "taw-4",
            "name": "Ward 4 \u2013 Lhou"
          },
          {
            "id": "taw-5",
            "name": "Ward 5 \u2013 Jang Area"
          }
        ]
      },
      {
        "id": "lower-subansiri",
        "name": "Lower Subansiri (Ziro)",
        "wards": [
          {
            "id": "zir-1",
            "name": "Ward 1 \u2013 Hapoli Central"
          },
          {
            "id": "zir-2",
            "name": "Ward 2 \u2013 Old Ziro"
          },
          {
            "id": "zir-3",
            "name": "Ward 3 \u2013 Hong Village"
          },
          {
            "id": "zir-4",
            "name": "Ward 4 \u2013 Hari"
          },
          {
            "id": "zir-5",
            "name": "Ward 5 \u2013 Siiro"
          }
        ]
      },
      {
        "id": "west-kameng",
        "name": "West Kameng (Bomdila)",
        "wards": [
          {
            "id": "bom-1",
            "name": "Ward 1 \u2013 Main Town"
          },
          {
            "id": "bom-2",
            "name": "Ward 2 \u2013 Upper Gompa"
          },
          {
            "id": "bom-3",
            "name": "Ward 3 \u2013 Lower Gompa"
          },
          {
            "id": "bom-4",
            "name": "Ward 4 \u2013 Bazaar Line"
          },
          {
            "id": "bom-5",
            "name": "Ward 5 \u2013 DC Colony"
          }
        ]
      }
    ]
  },
  {
    "id": "assam",
    "name": "Assam",
    "districts": [
      {
        "id": "kamrup-metropolitan",
        "name": "Kamrup Metropolitan (Guwahati)",
        "wards": [
          {
            "id": "gwh-1",
            "name": "Ward 1 \u2013 Paltan Bazaar"
          },
          {
            "id": "gwh-2",
            "name": "Ward 2 \u2013 Panbazar"
          },
          {
            "id": "gwh-3",
            "name": "Ward 3 \u2013 Dispur"
          },
          {
            "id": "gwh-4",
            "name": "Ward 4 \u2013 GS Road"
          },
          {
            "id": "gwh-5",
            "name": "Ward 5 \u2013 Ganeshguri"
          }
        ]
      },
      {
        "id": "dibrugarh",
        "name": "Dibrugarh",
        "wards": [
          {
            "id": "dbr-1",
            "name": "Ward 1 \u2013 Graham Bazaar"
          },
          {
            "id": "dbr-2",
            "name": "Ward 2 \u2013 Amolapatty"
          },
          {
            "id": "dbr-3",
            "name": "Ward 3 \u2013 Boiragimoth"
          },
          {
            "id": "dbr-4",
            "name": "Ward 4 \u2013 Chowkidinghee"
          },
          {
            "id": "dbr-5",
            "name": "Ward 5 \u2013 Naliapool"
          }
        ]
      },
      {
        "id": "cachar",
        "name": "Cachar (Silchar)",
        "wards": [
          {
            "id": "slc-1",
            "name": "Ward 1 \u2013 Tarapur"
          },
          {
            "id": "slc-2",
            "name": "Ward 2 \u2013 Ambicapatty"
          },
          {
            "id": "slc-3",
            "name": "Ward 3 \u2013 Rangirkhari"
          },
          {
            "id": "slc-4",
            "name": "Ward 4 \u2013 Meherpur"
          },
          {
            "id": "slc-5",
            "name": "Ward 5 \u2013 Malugram"
          }
        ]
      },
      {
        "id": "jorhat",
        "name": "Jorhat",
        "wards": [
          {
            "id": "jrt-1",
            "name": "Ward 1 \u2013 Garh Ali"
          },
          {
            "id": "jrt-2",
            "name": "Ward 2 \u2013 Tarajan"
          },
          {
            "id": "jrt-3",
            "name": "Ward 3 \u2013 Malow Ali"
          },
          {
            "id": "jrt-4",
            "name": "Ward 4 \u2013 Choladhara"
          },
          {
            "id": "jrt-5",
            "name": "Ward 5 \u2013 Kenduguri"
          }
        ]
      },
      {
        "id": "sonitpur",
        "name": "Sonitpur (Tezpur)",
        "wards": [
          {
            "id": "tez-1",
            "name": "Ward 1 \u2013 Tribeni"
          },
          {
            "id": "tez-2",
            "name": "Ward 2 \u2013 Mahabhairab"
          },
          {
            "id": "tez-3",
            "name": "Ward 3 \u2013 Chanmari"
          },
          {
            "id": "tez-4",
            "name": "Ward 4 \u2013 Mission Chariali"
          },
          {
            "id": "tez-5",
            "name": "Ward 5 \u2013 Porowa"
          }
        ]
      }
    ]
  },
  {
    "id": "bihar",
    "name": "Bihar",
    "districts": [
      {
        "id": "patna",
        "name": "Patna",
        "wards": [
          {
            "id": "pat-1",
            "name": "Ward 1 \u2013 Kankarbagh"
          },
          {
            "id": "pat-2",
            "name": "Ward 2 \u2013 Boring Road"
          },
          {
            "id": "pat-3",
            "name": "Ward 3 \u2013 Bailey Road"
          },
          {
            "id": "pat-4",
            "name": "Ward 4 \u2013 Rajendra Nagar"
          },
          {
            "id": "pat-5",
            "name": "Ward 5 \u2013 Fraser Road"
          }
        ]
      },
      {
        "id": "gaya",
        "name": "Gaya",
        "wards": [
          {
            "id": "gay-1",
            "name": "Ward 1 \u2013 Bodhgaya Road"
          },
          {
            "id": "gay-2",
            "name": "Ward 2 \u2013 Civil Lines"
          },
          {
            "id": "gay-3",
            "name": "Ward 3 \u2013 Chand Chaura"
          },
          {
            "id": "gay-4",
            "name": "Ward 4 \u2013 GB Road"
          },
          {
            "id": "gay-5",
            "name": "Ward 5 \u2013 Rampur"
          }
        ]
      },
      {
        "id": "bhagalpur",
        "name": "Bhagalpur",
        "wards": [
          {
            "id": "bgp-1",
            "name": "Ward 1 \u2013 Tilkamanjhi"
          },
          {
            "id": "bgp-2",
            "name": "Ward 2 \u2013 Khanjarpur"
          },
          {
            "id": "bgp-3",
            "name": "Ward 3 \u2013 Zero Mile"
          },
          {
            "id": "bgp-4",
            "name": "Ward 4 \u2013 Nathnagar"
          },
          {
            "id": "bgp-5",
            "name": "Ward 5 \u2013 Barari"
          }
        ]
      },
      {
        "id": "muzaffarpur",
        "name": "Muzaffarpur",
        "wards": [
          {
            "id": "muz-1",
            "name": "Ward 1 \u2013 Mithanpura"
          },
          {
            "id": "muz-2",
            "name": "Ward 2 \u2013 Brahmpura"
          },
          {
            "id": "muz-3",
            "name": "Ward 3 \u2013 Aghoria Bazaar"
          },
          {
            "id": "muz-4",
            "name": "Ward 4 \u2013 Gobarsahi"
          },
          {
            "id": "muz-5",
            "name": "Ward 5 \u2013 Kalyani"
          }
        ]
      },
      {
        "id": "darbhanga",
        "name": "Darbhanga",
        "wards": [
          {
            "id": "dbg-1",
            "name": "Ward 1 \u2013 Laheriasarai"
          },
          {
            "id": "dbg-2",
            "name": "Ward 2 \u2013 Tower Chowk"
          },
          {
            "id": "dbg-3",
            "name": "Ward 3 \u2013 Raj Darbhanga"
          },
          {
            "id": "dbg-4",
            "name": "Ward 4 \u2013 Benta"
          },
          {
            "id": "dbg-5",
            "name": "Ward 5 \u2013 Donar"
          }
        ]
      }
    ]
  },
  {
    "id": "chhattisgarh",
    "name": "Chhattisgarh",
    "districts": [
      {
        "id": "raipur",
        "name": "Raipur",
        "wards": [
          {
            "id": "rpr-1",
            "name": "Ward 1 \u2013 Shankar Nagar"
          },
          {
            "id": "rpr-2",
            "name": "Ward 2 \u2013 Pandri"
          },
          {
            "id": "rpr-3",
            "name": "Ward 3 \u2013 Telibandha"
          },
          {
            "id": "rpr-4",
            "name": "Ward 4 \u2013 Samta Colony"
          },
          {
            "id": "rpr-5",
            "name": "Ward 5 \u2013 Tatibandh"
          }
        ]
      },
      {
        "id": "bilaspur",
        "name": "Bilaspur",
        "wards": [
          {
            "id": "bil-1",
            "name": "Ward 1 \u2013 Vyapar Vihar"
          },
          {
            "id": "bil-2",
            "name": "Ward 2 \u2013 Nehru Nagar"
          },
          {
            "id": "bil-3",
            "name": "Ward 3 \u2013 Rajendra Nagar"
          },
          {
            "id": "bil-4",
            "name": "Ward 4 \u2013 Mangla"
          },
          {
            "id": "bil-5",
            "name": "Ward 5 \u2013 Sarkanda"
          }
        ]
      },
      {
        "id": "durg",
        "name": "Durg",
        "wards": [
          {
            "id": "drg-1",
            "name": "Ward 1 \u2013 Station Road"
          },
          {
            "id": "drg-2",
            "name": "Ward 2 \u2013 Padmanabhpur"
          },
          {
            "id": "drg-3",
            "name": "Ward 3 \u2013 Mohan Nagar"
          },
          {
            "id": "drg-4",
            "name": "Ward 4 \u2013 Ganj Para"
          },
          {
            "id": "drg-5",
            "name": "Ward 5 \u2013 Deepak Nagar"
          }
        ]
      },
      {
        "id": "bhilai",
        "name": "Bhilai",
        "wards": [
          {
            "id": "bhl-1",
            "name": "Ward 1 \u2013 Sector 1"
          },
          {
            "id": "bhl-2",
            "name": "Ward 2 \u2013 Sector 6"
          },
          {
            "id": "bhl-3",
            "name": "Ward 3 \u2013 Nehru Nagar East"
          },
          {
            "id": "bhl-4",
            "name": "Ward 4 \u2013 Supela"
          },
          {
            "id": "bhl-5",
            "name": "Ward 5 \u2013 Civic Centre"
          }
        ]
      },
      {
        "id": "korba",
        "name": "Korba",
        "wards": [
          {
            "id": "krb-1",
            "name": "Ward 1 \u2013 Transport Nagar"
          },
          {
            "id": "krb-2",
            "name": "Ward 2 \u2013 Kosabadi"
          },
          {
            "id": "krb-3",
            "name": "Ward 3 \u2013 Balco Nagar"
          },
          {
            "id": "krb-4",
            "name": "Ward 4 \u2013 Darri"
          },
          {
            "id": "krb-5",
            "name": "Ward 5 \u2013 TP Nagar"
          }
        ]
      }
    ]
  },
  {
    "id": "goa",
    "name": "Goa",
    "districts": [
      {
        "id": "north-goa",
        "name": "North Goa (Panaji)",
        "wards": [
          {
            "id": "pan-1",
            "name": "Ward 1 \u2013 Miramar"
          },
          {
            "id": "pan-2",
            "name": "Ward 2 \u2013 Fontainhas"
          },
          {
            "id": "pan-3",
            "name": "Ward 3 \u2013 Campal"
          },
          {
            "id": "pan-4",
            "name": "Ward 4 \u2013 Altinho"
          },
          {
            "id": "pan-5",
            "name": "Ward 5 \u2013 Dona Paula"
          }
        ]
      },
      {
        "id": "south-goa",
        "name": "South Goa (Margao)",
        "wards": [
          {
            "id": "mrg-1",
            "name": "Ward 1 \u2013 Fatorda"
          },
          {
            "id": "mrg-2",
            "name": "Ward 2 \u2013 Comba"
          },
          {
            "id": "mrg-3",
            "name": "Ward 3 \u2013 Aquem"
          },
          {
            "id": "mrg-4",
            "name": "Ward 4 \u2013 Borda"
          },
          {
            "id": "mrg-5",
            "name": "Ward 5 \u2013 Navelim Road"
          }
        ]
      },
      {
        "id": "vasco-da-gama",
        "name": "Mormugao (Vasco da Gama)",
        "wards": [
          {
            "id": "vsc-1",
            "name": "Ward 1 \u2013 Baina"
          },
          {
            "id": "vsc-2",
            "name": "Ward 2 \u2013 Chicalim"
          },
          {
            "id": "vsc-3",
            "name": "Ward 3 \u2013 Mangor Hill"
          },
          {
            "id": "vsc-4",
            "name": "Ward 4 \u2013 Dabolim"
          },
          {
            "id": "vsc-5",
            "name": "Ward 5 \u2013 Port Area"
          }
        ]
      },
      {
        "id": "mapusa",
        "name": "Bardez (Mapusa)",
        "wards": [
          {
            "id": "mps-1",
            "name": "Ward 1 \u2013 Market Complex"
          },
          {
            "id": "mps-2",
            "name": "Ward 2 \u2013 Khorlim"
          },
          {
            "id": "mps-3",
            "name": "Ward 3 \u2013 Ansabhat"
          },
          {
            "id": "mps-4",
            "name": "Ward 4 \u2013 Morod"
          },
          {
            "id": "mps-5",
            "name": "Ward 5 \u2013 Feira Alta"
          }
        ]
      },
      {
        "id": "ponda",
        "name": "Ponda",
        "wards": [
          {
            "id": "pnd-1",
            "name": "Ward 1 \u2013 Upper Bazaar"
          },
          {
            "id": "pnd-2",
            "name": "Ward 2 \u2013 Tisk"
          },
          {
            "id": "pnd-3",
            "name": "Ward 3 \u2013 Curti"
          },
          {
            "id": "pnd-4",
            "name": "Ward 4 \u2013 Sadar"
          },
          {
            "id": "pnd-5",
            "name": "Ward 5 \u2013 Khadpabandh"
          }
        ]
      }
    ]
  },
  {
    "id": "gujarat",
    "name": "Gujarat",
    "districts": [
      {
        "id": "ahmedabad",
        "name": "Ahmedabad",
        "wards": [
          {
            "id": "ahd-1",
            "name": "Ward 1 \u2013 Navrangpura"
          },
          {
            "id": "ahd-2",
            "name": "Ward 2 \u2013 Vastrapur"
          },
          {
            "id": "ahd-3",
            "name": "Ward 3 \u2013 Satellite"
          },
          {
            "id": "ahd-4",
            "name": "Ward 4 \u2013 Maninagar"
          },
          {
            "id": "ahd-5",
            "name": "Ward 5 \u2013 Bodakdev"
          }
        ]
      },
      {
        "id": "surat",
        "name": "Surat",
        "wards": [
          {
            "id": "srt-1",
            "name": "Ward 1 \u2013 Adajan"
          },
          {
            "id": "srt-2",
            "name": "Ward 2 \u2013 Vesu"
          },
          {
            "id": "srt-3",
            "name": "Ward 3 \u2013 Piplod"
          },
          {
            "id": "srt-4",
            "name": "Ward 4 \u2013 Varachha"
          },
          {
            "id": "srt-5",
            "name": "Ward 5 \u2013 Athwalines"
          }
        ]
      },
      {
        "id": "vadodara",
        "name": "Vadodara",
        "wards": [
          {
            "id": "vad-1",
            "name": "Ward 1 \u2013 Alkapuri"
          },
          {
            "id": "vad-2",
            "name": "Ward 2 \u2013 Sayajigunj"
          },
          {
            "id": "vad-3",
            "name": "Ward 3 \u2013 Fatehgunj"
          },
          {
            "id": "vad-4",
            "name": "Ward 4 \u2013 Manjalpur"
          },
          {
            "id": "vad-5",
            "name": "Ward 5 \u2013 Akota"
          }
        ]
      },
      {
        "id": "rajkot",
        "name": "Rajkot",
        "wards": [
          {
            "id": "raj-1",
            "name": "Ward 1 \u2013 Kalawad Road"
          },
          {
            "id": "raj-2",
            "name": "Ward 2 \u2013 Yagnik Road"
          },
          {
            "id": "raj-3",
            "name": "Ward 3 \u2013 University Road"
          },
          {
            "id": "raj-4",
            "name": "Ward 4 \u2013 Mavdi"
          },
          {
            "id": "raj-5",
            "name": "Ward 5 \u2013 Bhaktinagar"
          }
        ]
      },
      {
        "id": "bhavnagar",
        "name": "Bhavnagar",
        "wards": [
          {
            "id": "bhv-1",
            "name": "Ward 1 \u2013 Kaliyabid"
          },
          {
            "id": "bhv-2",
            "name": "Ward 2 \u2013 Sardarnagar"
          },
          {
            "id": "bhv-3",
            "name": "Ward 3 \u2013 Ghogha Circle"
          },
          {
            "id": "bhv-4",
            "name": "Ward 4 \u2013 Waghawadi Road"
          },
          {
            "id": "bhv-5",
            "name": "Ward 5 \u2013 Takhteshwar"
          }
        ]
      }
    ]
  },
  {
    "id": "haryana",
    "name": "Haryana",
    "districts": [
      {
        "id": "gurugram",
        "name": "Gurugram",
        "wards": [
          {
            "id": "gur-1",
            "name": "Ward 1 \u2013 Cyber City / DLF Phase 2"
          },
          {
            "id": "gur-2",
            "name": "Ward 2 \u2013 Sector 29 / Leisure Valley"
          },
          {
            "id": "gur-3",
            "name": "Ward 3 \u2013 Sector 56 / Golf Course Road"
          },
          {
            "id": "gur-4",
            "name": "Ward 4 \u2013 Sohna Road / Subhash Chowk"
          },
          {
            "id": "gur-5",
            "name": "Ward 5 \u2013 Old Gurugram / Sadar Bazaar"
          }
        ]
      },
      {
        "id": "faridabad",
        "name": "Faridabad",
        "wards": [
          {
            "id": "fbd-1",
            "name": "Ward 1 \u2013 Sector 15"
          },
          {
            "id": "fbd-2",
            "name": "Ward 2 \u2013 NIT 1"
          },
          {
            "id": "fbd-3",
            "name": "Ward 3 \u2013 Sector 21C"
          },
          {
            "id": "fbd-4",
            "name": "Ward 4 \u2013 Ballabhgarh"
          },
          {
            "id": "fbd-5",
            "name": "Ward 5 \u2013 Greater Faridabad"
          }
        ]
      },
      {
        "id": "panipat",
        "name": "Panipat",
        "wards": [
          {
            "id": "pnp-1",
            "name": "Ward 1 \u2013 Model Town"
          },
          {
            "id": "pnp-2",
            "name": "Ward 2 \u2013 GT Road"
          },
          {
            "id": "pnp-3",
            "name": "Ward 3 \u2013 Sector 12"
          },
          {
            "id": "pnp-4",
            "name": "Ward 4 \u2013 Sanoli Road"
          },
          {
            "id": "pnp-5",
            "name": "Ward 5 \u2013 Hali Colony"
          }
        ]
      },
      {
        "id": "ambala",
        "name": "Ambala",
        "wards": [
          {
            "id": "amb-1",
            "name": "Ward 1 \u2013 Ambala Cantt"
          },
          {
            "id": "amb-2",
            "name": "Ward 2 \u2013 Ambala City"
          },
          {
            "id": "amb-3",
            "name": "Ward 3 \u2013 Model Town"
          },
          {
            "id": "amb-4",
            "name": "Ward 4 \u2013 Cloth Market"
          },
          {
            "id": "amb-5",
            "name": "Ward 5 \u2013 Sector 7"
          }
        ]
      },
      {
        "id": "karnal",
        "name": "Karnal",
        "wards": [
          {
            "id": "knl-h-1",
            "name": "Ward 1 \u2013 Sector 13"
          },
          {
            "id": "knl-h-2",
            "name": "Ward 2 \u2013 Model Town"
          },
          {
            "id": "knl-h-3",
            "name": "Ward 3 \u2013 Kunjpura Road"
          },
          {
            "id": "knl-h-4",
            "name": "Ward 4 \u2013 Mughal Canal"
          },
          {
            "id": "knl-h-5",
            "name": "Ward 5 \u2013 Meerut Road"
          }
        ]
      }
    ]
  },
  {
    "id": "himachal-pradesh",
    "name": "Himachal Pradesh",
    "districts": [
      {
        "id": "shimla",
        "name": "Shimla",
        "wards": [
          {
            "id": "sml-1",
            "name": "Ward 1 \u2013 The Mall"
          },
          {
            "id": "sml-2",
            "name": "Ward 2 \u2013 Sanjauli"
          },
          {
            "id": "sml-3",
            "name": "Ward 3 \u2013 Chotta Shimla"
          },
          {
            "id": "sml-4",
            "name": "Ward 4 \u2013 Jakhoo"
          },
          {
            "id": "sml-5",
            "name": "Ward 5 \u2013 Summer Hill"
          }
        ]
      },
      {
        "id": "kangra",
        "name": "Kangra (Dharamshala)",
        "wards": [
          {
            "id": "dha-1",
            "name": "Ward 1 \u2013 McLeod Ganj"
          },
          {
            "id": "dha-2",
            "name": "Ward 2 \u2013 Kotwali Bazaar"
          },
          {
            "id": "dha-3",
            "name": "Ward 3 \u2013 Forsyth Ganj"
          },
          {
            "id": "dha-4",
            "name": "Ward 4 \u2013 Bhagsu Road"
          },
          {
            "id": "dha-5",
            "name": "Ward 5 \u2013 Dari"
          }
        ]
      },
      {
        "id": "solan",
        "name": "Solan",
        "wards": [
          {
            "id": "sln-1",
            "name": "Ward 1 \u2013 Mall Road"
          },
          {
            "id": "sln-2",
            "name": "Ward 2 \u2013 Kumarhatti Road"
          },
          {
            "id": "sln-3",
            "name": "Ward 3 \u2013 Chambaghat"
          },
          {
            "id": "sln-4",
            "name": "Ward 4 \u2013 Kotla Nala"
          },
          {
            "id": "sln-5",
            "name": "Ward 5 \u2013 Saproon"
          }
        ]
      },
      {
        "id": "mandi",
        "name": "Mandi",
        "wards": [
          {
            "id": "mnd-1",
            "name": "Ward 1 \u2013 Indira Market"
          },
          {
            "id": "mnd-2",
            "name": "Ward 2 \u2013 Bhiuli"
          },
          {
            "id": "mnd-3",
            "name": "Ward 3 \u2013 Samkhetar"
          },
          {
            "id": "mnd-4",
            "name": "Ward 4 \u2013 Suhra Mohalla"
          },
          {
            "id": "mnd-5",
            "name": "Ward 5 \u2013 Purani Mandi"
          }
        ]
      },
      {
        "id": "kullu",
        "name": "Kullu (Manali)",
        "wards": [
          {
            "id": "klu-1",
            "name": "Ward 1 \u2013 Dhalpur"
          },
          {
            "id": "klu-2",
            "name": "Ward 2 \u2013 Sarvari Bazaar"
          },
          {
            "id": "klu-3",
            "name": "Ward 3 \u2013 Manali Mall Road"
          },
          {
            "id": "klu-4",
            "name": "Ward 4 \u2013 Old Manali"
          },
          {
            "id": "klu-5",
            "name": "Ward 5 \u2013 Aleo"
          }
        ]
      }
    ]
  },
  {
    "id": "jharkhand",
    "name": "Jharkhand",
    "districts": [
      {
        "id": "ranchi",
        "name": "Ranchi",
        "wards": [
          {
            "id": "ran-1",
            "name": "Ward 1 \u2013 Main Road / Albert Ekka Chowk"
          },
          {
            "id": "ran-2",
            "name": "Ward 2 \u2013 Harmu Housing Colony"
          },
          {
            "id": "ran-3",
            "name": "Ward 3 \u2013 Lalpur"
          },
          {
            "id": "ran-4",
            "name": "Ward 4 \u2013 Doranda"
          },
          {
            "id": "ran-5",
            "name": "Ward 5 \u2013 Morabadi"
          }
        ]
      },
      {
        "id": "east-singhbhum",
        "name": "East Singhbhum (Jamshedpur)",
        "wards": [
          {
            "id": "jsr-1",
            "name": "Ward 1 \u2013 Bistupur"
          },
          {
            "id": "jsr-2",
            "name": "Ward 2 \u2013 Sakchi"
          },
          {
            "id": "jsr-3",
            "name": "Ward 3 \u2013 Kadma"
          },
          {
            "id": "jsr-4",
            "name": "Ward 4 \u2013 Sonari"
          },
          {
            "id": "jsr-5",
            "name": "Ward 5 \u2013 Telco Colony"
          }
        ]
      },
      {
        "id": "dhanbad",
        "name": "Dhanbad",
        "wards": [
          {
            "id": "dhn-1",
            "name": "Ward 1 \u2013 Bank More"
          },
          {
            "id": "dhn-2",
            "name": "Ward 2 \u2013 Saraidhela"
          },
          {
            "id": "dhn-3",
            "name": "Ward 3 \u2013 Hirapur"
          },
          {
            "id": "dhn-4",
            "name": "Ward 4 \u2013 Jharia Main Road"
          },
          {
            "id": "dhn-5",
            "name": "Ward 5 \u2013 Dhansar"
          }
        ]
      },
      {
        "id": "bokaro",
        "name": "Bokaro",
        "wards": [
          {
            "id": "bok-1",
            "name": "Ward 1 \u2013 Sector 4"
          },
          {
            "id": "bok-2",
            "name": "Ward 2 \u2013 Sector 1"
          },
          {
            "id": "bok-3",
            "name": "Ward 3 \u2013 Chas Bazaar"
          },
          {
            "id": "bok-4",
            "name": "Ward 4 \u2013 City Centre"
          },
          {
            "id": "bok-5",
            "name": "Ward 5 \u2013 Sector 9"
          }
        ]
      },
      {
        "id": "hazaribagh",
        "name": "Hazaribagh",
        "wards": [
          {
            "id": "hzb-1",
            "name": "Ward 1 \u2013 Annada Chowk"
          },
          {
            "id": "hzb-2",
            "name": "Ward 2 \u2013 Matwari"
          },
          {
            "id": "hzb-3",
            "name": "Ward 3 \u2013 Korrah"
          },
          {
            "id": "hzb-4",
            "name": "Ward 4 \u2013 Boddom Bazaar"
          },
          {
            "id": "hzb-5",
            "name": "Ward 5 \u2013 Pelawal"
          }
        ]
      }
    ]
  },
  {
    "id": "karnataka",
    "name": "Karnataka",
    "districts": [
      {
        "id": "bengaluru-urban",
        "name": "Bengaluru Urban (BBMP)",
        "wards": [
          {
            "id": "blr-1",
            "name": "Ward 1 \u2013 Indiranagar"
          },
          {
            "id": "blr-2",
            "name": "Ward 2 \u2013 Koramangala"
          },
          {
            "id": "blr-3",
            "name": "Ward 3 \u2013 Whitefield"
          },
          {
            "id": "blr-4",
            "name": "Ward 4 \u2013 Jayanagar"
          },
          {
            "id": "blr-5",
            "name": "Ward 5 \u2013 Malleshwaram"
          }
        ]
      },
      {
        "id": "mysuru",
        "name": "Mysuru",
        "wards": [
          {
            "id": "mys-1",
            "name": "Ward 1 \u2013 Gokulam"
          },
          {
            "id": "mys-2",
            "name": "Ward 2 \u2013 Jayalakshmipuram"
          },
          {
            "id": "mys-3",
            "name": "Ward 3 \u2013 Saraswathipuram"
          },
          {
            "id": "mys-4",
            "name": "Ward 4 \u2013 Kuvempunagar"
          },
          {
            "id": "mys-5",
            "name": "Ward 5 \u2013 Vijayanagar"
          }
        ]
      },
      {
        "id": "dharwad",
        "name": "Hubli-Dharwad",
        "wards": [
          {
            "id": "hbl-1",
            "name": "Ward 1 \u2013 Vidyanagar"
          },
          {
            "id": "hbl-2",
            "name": "Ward 2 \u2013 Gokul Road"
          },
          {
            "id": "hbl-3",
            "name": "Ward 3 \u2013 Keshwapur"
          },
          {
            "id": "hbl-4",
            "name": "Ward 4 \u2013 Dharwad Line Bazaar"
          },
          {
            "id": "hbl-5",
            "name": "Ward 5 \u2013 Unkal Lake Area"
          }
        ]
      },
      {
        "id": "dakshina-kannada",
        "name": "Dakshina Kannada (Mangaluru)",
        "wards": [
          {
            "id": "mng-1",
            "name": "Ward 1 \u2013 Kadri"
          },
          {
            "id": "mng-2",
            "name": "Ward 2 \u2013 Bejai"
          },
          {
            "id": "mng-3",
            "name": "Ward 3 \u2013 Hampankatta"
          },
          {
            "id": "mng-4",
            "name": "Ward 4 \u2013 Lalbagh"
          },
          {
            "id": "mng-5",
            "name": "Ward 5 \u2013 Urwa"
          }
        ]
      },
      {
        "id": "belagavi",
        "name": "Belagavi",
        "wards": [
          {
            "id": "bel-1",
            "name": "Ward 1 \u2013 Tilakwadi"
          },
          {
            "id": "bel-2",
            "name": "Ward 2 \u2013 Camp Area"
          },
          {
            "id": "bel-3",
            "name": "Ward 3 \u2013 Shahapur"
          },
          {
            "id": "bel-4",
            "name": "Ward 4 \u2013 Vadgaon"
          },
          {
            "id": "bel-5",
            "name": "Ward 5 \u2013 Khade Bazaar"
          }
        ]
      }
    ]
  },
  {
    "id": "kerala",
    "name": "Kerala",
    "districts": [
      {
        "id": "thiruvananthapuram",
        "name": "Thiruvananthapuram",
        "wards": [
          {
            "id": "tvm-1",
            "name": "Ward 1 \u2013 Kowdiar"
          },
          {
            "id": "tvm-2",
            "name": "Ward 2 \u2013 Palayam"
          },
          {
            "id": "tvm-3",
            "name": "Ward 3 \u2013 Pattom"
          },
          {
            "id": "tvm-4",
            "name": "Ward 4 \u2013 Kazhakoottam (Technopark)"
          },
          {
            "id": "tvm-5",
            "name": "Ward 5 \u2013 East Fort"
          }
        ]
      },
      {
        "id": "ernakulam",
        "name": "Ernakulam (Kochi)",
        "wards": [
          {
            "id": "koc-1",
            "name": "Ward 1 \u2013 Marine Drive / MG Road"
          },
          {
            "id": "koc-2",
            "name": "Ward 2 \u2013 Panampilly Nagar"
          },
          {
            "id": "koc-3",
            "name": "Ward 3 \u2013 Fort Kochi"
          },
          {
            "id": "koc-4",
            "name": "Ward 4 \u2013 Kakkanad (Infopark)"
          },
          {
            "id": "koc-5",
            "name": "Ward 5 \u2013 Edappally"
          }
        ]
      },
      {
        "id": "kozhikode",
        "name": "Kozhikode (Calicut)",
        "wards": [
          {
            "id": "clt-1",
            "name": "Ward 1 \u2013 Mananchira"
          },
          {
            "id": "clt-2",
            "name": "Ward 2 \u2013 Mavoor Road"
          },
          {
            "id": "clt-3",
            "name": "Ward 3 \u2013 Beach Road"
          },
          {
            "id": "clt-4",
            "name": "Ward 4 \u2013 Nadakkavu"
          },
          {
            "id": "clt-5",
            "name": "Ward 5 \u2013 Chevayur"
          }
        ]
      },
      {
        "id": "thrissur",
        "name": "Thrissur",
        "wards": [
          {
            "id": "tcr-1",
            "name": "Ward 1 \u2013 Swaraj Round"
          },
          {
            "id": "tcr-2",
            "name": "Ward 2 \u2013 Ayyanthole"
          },
          {
            "id": "tcr-3",
            "name": "Ward 3 \u2013 Ollur"
          },
          {
            "id": "tcr-4",
            "name": "Ward 4 \u2013 Poothole"
          },
          {
            "id": "tcr-5",
            "name": "Ward 5 \u2013 Punkunnam"
          }
        ]
      },
      {
        "id": "kollam",
        "name": "Kollam",
        "wards": [
          {
            "id": "klm-1",
            "name": "Ward 1 \u2013 Chinnakada"
          },
          {
            "id": "klm-2",
            "name": "Ward 2 \u2013 Asramam"
          },
          {
            "id": "klm-3",
            "name": "Ward 3 \u2013 Tangasseri"
          },
          {
            "id": "klm-4",
            "name": "Ward 4 \u2013 Thirumullavaram"
          },
          {
            "id": "klm-5",
            "name": "Ward 5 \u2013 Kadappakada"
          }
        ]
      }
    ]
  },
  {
    "id": "madhya-pradesh",
    "name": "Madhya Pradesh",
    "districts": [
      {
        "id": "indore",
        "name": "Indore",
        "wards": [
          {
            "id": "ind-1",
            "name": "Ward 1 \u2013 Vijay Nagar"
          },
          {
            "id": "ind-2",
            "name": "Ward 2 \u2013 Palasia"
          },
          {
            "id": "ind-3",
            "name": "Ward 3 \u2013 Rajwada"
          },
          {
            "id": "ind-4",
            "name": "Ward 4 \u2013 Bhawar Kuan"
          },
          {
            "id": "ind-5",
            "name": "Ward 5 \u2013 Chappan Dukan"
          }
        ]
      },
      {
        "id": "bhopal",
        "name": "Bhopal",
        "wards": [
          {
            "id": "bpl-1",
            "name": "Ward 1 \u2013 MP Nagar"
          },
          {
            "id": "bpl-2",
            "name": "Ward 2 \u2013 Arera Colony"
          },
          {
            "id": "bpl-3",
            "name": "Ward 3 \u2013 Shahpura"
          },
          {
            "id": "bpl-4",
            "name": "Ward 4 \u2013 New Market"
          },
          {
            "id": "bpl-5",
            "name": "Ward 5 \u2013 Kolar Road"
          }
        ]
      },
      {
        "id": "jabalpur",
        "name": "Jabalpur",
        "wards": [
          {
            "id": "jbl-1",
            "name": "Ward 1 \u2013 Civil Lines"
          },
          {
            "id": "jbl-2",
            "name": "Ward 2 \u2013 Wright Town"
          },
          {
            "id": "jbl-3",
            "name": "Ward 3 \u2013 Napier Town"
          },
          {
            "id": "jbl-4",
            "name": "Ward 4 \u2013 Madan Mahal"
          },
          {
            "id": "jbl-5",
            "name": "Ward 5 \u2013 Gorakhpur"
          }
        ]
      },
      {
        "id": "gwalior",
        "name": "Gwalior",
        "wards": [
          {
            "id": "gwl-1",
            "name": "Ward 1 \u2013 City Centre"
          },
          {
            "id": "gwl-2",
            "name": "Ward 2 \u2013 Lashkar"
          },
          {
            "id": "gwl-3",
            "name": "Ward 3 \u2013 Morar"
          },
          {
            "id": "gwl-4",
            "name": "Ward 4 \u2013 Maharaj Bada"
          },
          {
            "id": "gwl-5",
            "name": "Ward 5 \u2013 Thatipur"
          }
        ]
      },
      {
        "id": "ujjain",
        "name": "Ujjain",
        "wards": [
          {
            "id": "ujj-1",
            "name": "Ward 1 \u2013 Freeganj"
          },
          {
            "id": "ujj-2",
            "name": "Ward 2 \u2013 Mahakal Marg"
          },
          {
            "id": "ujj-3",
            "name": "Ward 3 \u2013 Tower Chowk"
          },
          {
            "id": "ujj-4",
            "name": "Ward 4 \u2013 Nanakheda"
          },
          {
            "id": "ujj-5",
            "name": "Ward 5 \u2013 Dewas Gate"
          }
        ]
      }
    ]
  },
  {
    "id": "maharashtra",
    "name": "Maharashtra",
    "districts": [
      {
        "id": "mumbai-city",
        "name": "Mumbai City",
        "wards": [
          {
            "id": "mum-1",
            "name": "Ward A \u2013 Colaba & Fort"
          },
          {
            "id": "mum-2",
            "name": "Ward C \u2013 Marine Lines"
          },
          {
            "id": "mum-3",
            "name": "Ward D \u2013 Malabar Hill"
          },
          {
            "id": "mum-4",
            "name": "Ward G/S \u2013 Worli"
          },
          {
            "id": "mum-5",
            "name": "Ward G/N \u2013 Dadar"
          }
        ]
      },
      {
        "id": "mumbai-suburban",
        "name": "Mumbai Suburban",
        "wards": [
          {
            "id": "sub-1",
            "name": "Ward H/W \u2013 Bandra West"
          },
          {
            "id": "sub-2",
            "name": "Ward K/W \u2013 Andheri West"
          },
          {
            "id": "sub-3",
            "name": "Ward P/S \u2013 Goregaon"
          },
          {
            "id": "sub-4",
            "name": "Ward R/S \u2013 Kandivali"
          },
          {
            "id": "sub-5",
            "name": "Ward R/C \u2013 Borivali"
          }
        ]
      },
      {
        "id": "pune",
        "name": "Pune",
        "wards": [
          {
            "id": "pune-1",
            "name": "Ward 1 \u2013 Shivajinagar"
          },
          {
            "id": "pune-2",
            "name": "Ward 2 \u2013 Kothrud"
          },
          {
            "id": "pune-3",
            "name": "Ward 3 \u2013 Viman Nagar"
          },
          {
            "id": "pune-4",
            "name": "Ward 4 \u2013 Baner / Balewadi"
          },
          {
            "id": "pune-5",
            "name": "Ward 5 \u2013 Hadapsar / Magarpatta"
          }
        ]
      },
      {
        "id": "nagpur",
        "name": "Nagpur",
        "wards": [
          {
            "id": "ngp-1",
            "name": "Ward 1 \u2013 Dharampeth"
          },
          {
            "id": "ngp-2",
            "name": "Ward 2 \u2013 Ramdaspeth"
          },
          {
            "id": "ngp-3",
            "name": "Ward 3 \u2013 Sitabuldi"
          },
          {
            "id": "ngp-4",
            "name": "Ward 4 \u2013 Civil Lines"
          },
          {
            "id": "ngp-5",
            "name": "Ward 5 \u2013 Wardha Road"
          }
        ]
      },
      {
        "id": "thane",
        "name": "Thane",
        "wards": [
          {
            "id": "thn-1",
            "name": "Ward 1 \u2013 Naupada"
          },
          {
            "id": "thn-2",
            "name": "Ward 2 \u2013 Ghodbunder Road"
          },
          {
            "id": "thn-3",
            "name": "Ward 3 \u2013 Majiwada"
          },
          {
            "id": "thn-4",
            "name": "Ward 4 \u2013 Vartak Nagar"
          },
          {
            "id": "thn-5",
            "name": "Ward 5 \u2013 Pachpakhadi"
          }
        ]
      }
    ]
  },
  {
    "id": "manipur",
    "name": "Manipur",
    "districts": [
      {
        "id": "imphal-west",
        "name": "Imphal West",
        "wards": [
          {
            "id": "imp-w-1",
            "name": "Ward 1 \u2013 Thangal Bazaar"
          },
          {
            "id": "imp-w-2",
            "name": "Ward 2 \u2013 Paona Bazaar"
          },
          {
            "id": "imp-w-3",
            "name": "Ward 3 \u2013 Uripok"
          },
          {
            "id": "imp-w-4",
            "name": "Ward 4 \u2013 Sagolband"
          },
          {
            "id": "imp-w-5",
            "name": "Ward 5 \u2013 Keishamthong"
          }
        ]
      },
      {
        "id": "imphal-east",
        "name": "Imphal East",
        "wards": [
          {
            "id": "imp-e-1",
            "name": "Ward 1 \u2013 Porompat"
          },
          {
            "id": "imp-e-2",
            "name": "Ward 2 \u2013 Palace Compound"
          },
          {
            "id": "imp-e-3",
            "name": "Ward 3 \u2013 Wangkhei"
          },
          {
            "id": "imp-e-4",
            "name": "Ward 4 \u2013 Khurai"
          },
          {
            "id": "imp-e-5",
            "name": "Ward 5 \u2013 Lamlong"
          }
        ]
      },
      {
        "id": "thoubal",
        "name": "Thoubal",
        "wards": [
          {
            "id": "tbl-1",
            "name": "Ward 1 \u2013 Thoubal Bazaar"
          },
          {
            "id": "tbl-2",
            "name": "Ward 2 \u2013 Wangjing"
          },
          {
            "id": "tbl-3",
            "name": "Ward 3 \u2013 Yairipok"
          },
          {
            "id": "tbl-4",
            "name": "Ward 4 \u2013 Heirok"
          },
          {
            "id": "tbl-5",
            "name": "Ward 5 \u2013 Kakching Road"
          }
        ]
      },
      {
        "id": "bishnupur",
        "name": "Bishnupur",
        "wards": [
          {
            "id": "bsp-1",
            "name": "Ward 1 \u2013 Loktak Lake View"
          },
          {
            "id": "bsp-2",
            "name": "Ward 2 \u2013 Moirang Bazaar"
          },
          {
            "id": "bsp-3",
            "name": "Ward 3 \u2013 Nambol"
          },
          {
            "id": "bsp-4",
            "name": "Ward 4 \u2013 Oinam"
          },
          {
            "id": "bsp-5",
            "name": "Ward 5 \u2013 Kumbi"
          }
        ]
      },
      {
        "id": "churachandpur",
        "name": "Churachandpur",
        "wards": [
          {
            "id": "ccp-1",
            "name": "Ward 1 \u2013 Tuibong"
          },
          {
            "id": "ccp-2",
            "name": "Ward 2 \u2013 New Lamka"
          },
          {
            "id": "ccp-3",
            "name": "Ward 3 \u2013 Rengkai"
          },
          {
            "id": "ccp-4",
            "name": "Ward 4 \u2013 Hiangtam Lamka"
          },
          {
            "id": "ccp-5",
            "name": "Ward 5 \u2013 Bungmual"
          }
        ]
      }
    ]
  },
  {
    "id": "meghalaya",
    "name": "Meghalaya",
    "districts": [
      {
        "id": "east-khasi-hills",
        "name": "East Khasi Hills (Shillong)",
        "wards": [
          {
            "id": "shl-1",
            "name": "Ward 1 \u2013 Police Bazar"
          },
          {
            "id": "shl-2",
            "name": "Ward 2 \u2013 Laitumkhrah"
          },
          {
            "id": "shl-3",
            "name": "Ward 3 \u2013 Laban"
          },
          {
            "id": "shl-4",
            "name": "Ward 4 \u2013 Malki"
          },
          {
            "id": "shl-5",
            "name": "Ward 5 \u2013 Polo Ground"
          }
        ]
      },
      {
        "id": "west-garo-hills",
        "name": "West Garo Hills (Tura)",
        "wards": [
          {
            "id": "tur-1",
            "name": "Ward 1 \u2013 Tura Bazaar"
          },
          {
            "id": "tur-2",
            "name": "Ward 2 \u2013 Chandmari"
          },
          {
            "id": "tur-3",
            "name": "Ward 3 \u2013 Dobasipara"
          },
          {
            "id": "tur-4",
            "name": "Ward 4 \u2013 Hawakhana"
          },
          {
            "id": "tur-5",
            "name": "Ward 5 \u2013 Araimile"
          }
        ]
      },
      {
        "id": "west-jaintia-hills",
        "name": "West Jaintia Hills (Jowai)",
        "wards": [
          {
            "id": "jow-1",
            "name": "Ward 1 \u2013 Iawmusiang"
          },
          {
            "id": "jow-2",
            "name": "Ward 2 \u2013 Ladthadlaboh"
          },
          {
            "id": "jow-3",
            "name": "Ward 3 \u2013 Chutwakhu"
          },
          {
            "id": "jow-4",
            "name": "Ward 4 \u2013 Mynthong"
          },
          {
            "id": "jow-5",
            "name": "Ward 5 \u2013 Panaliar"
          }
        ]
      },
      {
        "id": "ri-bhoi",
        "name": "Ri-Bhoi (Nongpoh)",
        "wards": [
          {
            "id": "ngp-m-1",
            "name": "Ward 1 \u2013 Main Bazaar"
          },
          {
            "id": "ngp-m-2",
            "name": "Ward 2 \u2013 Pahamsyiem"
          },
          {
            "id": "ngp-m-3",
            "name": "Ward 3 \u2013 Umsning Road"
          },
          {
            "id": "ngp-m-4",
            "name": "Ward 4 \u2013 Byrnihat Line"
          },
          {
            "id": "ngp-m-5",
            "name": "Ward 5 \u2013 Zeropoint"
          }
        ]
      },
      {
        "id": "south-garo-hills",
        "name": "South Garo Hills (Baghmara)",
        "wards": [
          {
            "id": "bgm-1",
            "name": "Ward 1 \u2013 Baghmara Bazar"
          },
          {
            "id": "bgm-2",
            "name": "Ward 2 \u2013 Simsang Riverbank"
          },
          {
            "id": "bgm-3",
            "name": "Ward 3 \u2013 Rangira"
          },
          {
            "id": "bgm-4",
            "name": "Ward 4 \u2013 Panda"
          },
          {
            "id": "bgm-5",
            "name": "Ward 5 \u2013 Siju Road"
          }
        ]
      }
    ]
  },
  {
    "id": "mizoram",
    "name": "Mizoram",
    "districts": [
      {
        "id": "aizawl",
        "name": "Aizawl",
        "wards": [
          {
            "id": "azl-1",
            "name": "Ward 1 \u2013 Zarkawt"
          },
          {
            "id": "azl-2",
            "name": "Ward 2 \u2013 Chanmari"
          },
          {
            "id": "azl-3",
            "name": "Ward 3 \u2013 Khatla"
          },
          {
            "id": "azl-4",
            "name": "Ward 4 \u2013 Mission Veng"
          },
          {
            "id": "azl-5",
            "name": "Ward 5 \u2013 Bawngkawn"
          }
        ]
      },
      {
        "id": "lunglei",
        "name": "Lunglei",
        "wards": [
          {
            "id": "lgl-1",
            "name": "Ward 1 \u2013 Bazar Veng"
          },
          {
            "id": "lgl-2",
            "name": "Ward 2 \u2013 Venglai"
          },
          {
            "id": "lgl-3",
            "name": "Ward 3 \u2013 Rahsi Veng"
          },
          {
            "id": "lgl-4",
            "name": "Ward 4 \u2013 Chanmari"
          },
          {
            "id": "lgl-5",
            "name": "Ward 5 \u2013 Farm Veng"
          }
        ]
      },
      {
        "id": "champhai",
        "name": "Champhai",
        "wards": [
          {
            "id": "cmp-1",
            "name": "Ward 1 \u2013 Kahrawt"
          },
          {
            "id": "cmp-2",
            "name": "Ward 2 \u2013 Vengthlang"
          },
          {
            "id": "cmp-3",
            "name": "Ward 3 \u2013 Zote"
          },
          {
            "id": "cmp-4",
            "name": "Ward 4 \u2013 Bethel Veng"
          },
          {
            "id": "cmp-5",
            "name": "Ward 5 \u2013 Kanan Veng"
          }
        ]
      },
      {
        "id": "kolasib",
        "name": "Kolasib",
        "wards": [
          {
            "id": "klb-1",
            "name": "Ward 1 \u2013 Diakkawn"
          },
          {
            "id": "klb-2",
            "name": "Ward 2 \u2013 Venglai"
          },
          {
            "id": "klb-3",
            "name": "Ward 3 \u2013 Banglakawn"
          },
          {
            "id": "klb-4",
            "name": "Ward 4 \u2013 Khuangpuilam"
          },
          {
            "id": "klb-5",
            "name": "Ward 5 \u2013 Project Veng"
          }
        ]
      },
      {
        "id": "serchhip",
        "name": "Serchhip",
        "wards": [
          {
            "id": "src-1",
            "name": "Ward 1 \u2013 New Serchhip"
          },
          {
            "id": "src-2",
            "name": "Ward 2 \u2013 Vengchung"
          },
          {
            "id": "src-3",
            "name": "Ward 3 \u2013 Bazar Veng"
          },
          {
            "id": "src-4",
            "name": "Ward 4 \u2013 Sailiam"
          },
          {
            "id": "src-5",
            "name": "Ward 5 \u2013 Chhiahtlang"
          }
        ]
      }
    ]
  },
  {
    "id": "nagaland",
    "name": "Nagaland",
    "districts": [
      {
        "id": "kohima",
        "name": "Kohima",
        "wards": [
          {
            "id": "khm-1",
            "name": "Ward 1 \u2013 High School Area"
          },
          {
            "id": "khm-2",
            "name": "Ward 2 \u2013 Main Town / Razhu Point"
          },
          {
            "id": "khm-3",
            "name": "Ward 3 \u2013 Midland"
          },
          {
            "id": "khm-4",
            "name": "Ward 4 \u2013 PR Hill"
          },
          {
            "id": "khm-5",
            "name": "Ward 5 \u2013 D-Block"
          }
        ]
      },
      {
        "id": "dimapur",
        "name": "Dimapur",
        "wards": [
          {
            "id": "dmp-1",
            "name": "Ward 1 \u2013 Circular Road"
          },
          {
            "id": "dmp-2",
            "name": "Ward 2 \u2013 Duncan Bosti"
          },
          {
            "id": "dmp-3",
            "name": "Ward 3 \u2013 Notun Bosti"
          },
          {
            "id": "dmp-4",
            "name": "Ward 4 \u2013 Nagarjan"
          },
          {
            "id": "dmp-5",
            "name": "Ward 5 \u2013 Purana Bazaar"
          }
        ]
      },
      {
        "id": "mokokchung",
        "name": "Mokokchung",
        "wards": [
          {
            "id": "mkc-1",
            "name": "Ward 1 \u2013 Arkong"
          },
          {
            "id": "mkc-2",
            "name": "Ward 2 \u2013 Dilong"
          },
          {
            "id": "mkc-3",
            "name": "Ward 3 \u2013 Penli"
          },
          {
            "id": "mkc-4",
            "name": "Ward 4 \u2013 Salangtem"
          },
          {
            "id": "mkc-5",
            "name": "Ward 5 \u2013 Artang"
          }
        ]
      },
      {
        "id": "tuensang",
        "name": "Tuensang",
        "wards": [
          {
            "id": "tsg-1",
            "name": "Ward 1 \u2013 High School Ward"
          },
          {
            "id": "tsg-2",
            "name": "Ward 2 \u2013 Bazaar Ward"
          },
          {
            "id": "tsg-3",
            "name": "Ward 3 \u2013 Medical Ward"
          },
          {
            "id": "tsg-4",
            "name": "Ward 4 \u2013 St. John Ward"
          },
          {
            "id": "tsg-5",
            "name": "Ward 5 \u2013 Police Point"
          }
        ]
      },
      {
        "id": "wokha",
        "name": "Wokha",
        "wards": [
          {
            "id": "wkh-1",
            "name": "Ward 1 \u2013 Tzonchu"
          },
          {
            "id": "wkh-2",
            "name": "Ward 2 \u2013 Likya"
          },
          {
            "id": "wkh-3",
            "name": "Ward 3 \u2013 GHSS Ward"
          },
          {
            "id": "wkh-4",
            "name": "Ward 4 \u2013 Etsuchukha"
          },
          {
            "id": "wkh-5",
            "name": "Ward 5 \u2013 Longsa Road"
          }
        ]
      }
    ]
  },
  {
    "id": "odisha",
    "name": "Odisha",
    "districts": [
      {
        "id": "khordha",
        "name": "Khordha (Bhubaneswar)",
        "wards": [
          {
            "id": "bbsr-1",
            "name": "Ward 1 \u2013 Saheed Nagar"
          },
          {
            "id": "bbsr-2",
            "name": "Ward 2 \u2013 Patia / Infocity"
          },
          {
            "id": "bbsr-3",
            "name": "Ward 3 \u2013 Nayapalli"
          },
          {
            "id": "bbsr-4",
            "name": "Ward 4 \u2013 Khandagiri"
          },
          {
            "id": "bbsr-5",
            "name": "Ward 5 \u2013 Chandrasekharpur"
          }
        ]
      },
      {
        "id": "cuttack",
        "name": "Cuttack",
        "wards": [
          {
            "id": "ctk-1",
            "name": "Ward 1 \u2013 Badambadi"
          },
          {
            "id": "ctk-2",
            "name": "Ward 2 \u2013 Choudhury Bazar"
          },
          {
            "id": "ctk-3",
            "name": "Ward 3 \u2013 CDA Sector 6"
          },
          {
            "id": "ctk-4",
            "name": "Ward 4 \u2013 Ranihat"
          },
          {
            "id": "ctk-5",
            "name": "Ward 5 \u2013 Buxi Bazar"
          }
        ]
      },
      {
        "id": "sundargarh",
        "name": "Sundargarh (Rourkela)",
        "wards": [
          {
            "id": "rkl-1",
            "name": "Ward 1 \u2013 Sector 1 / Plant Site"
          },
          {
            "id": "rkl-2",
            "name": "Ward 2 \u2013 Sector 5"
          },
          {
            "id": "rkl-3",
            "name": "Ward 3 \u2013 Civil Township"
          },
          {
            "id": "rkl-4",
            "name": "Ward 4 \u2013 Koel Nagar"
          },
          {
            "id": "rkl-5",
            "name": "Ward 5 \u2013 Chhend Colony"
          }
        ]
      },
      {
        "id": "ganjam",
        "name": "Ganjam (Berhampur)",
        "wards": [
          {
            "id": "ber-1",
            "name": "Ward 1 \u2013 Gandhinagar"
          },
          {
            "id": "ber-2",
            "name": "Ward 2 \u2013 Gosaninuagaon"
          },
          {
            "id": "ber-3",
            "name": "Ward 3 \u2013 Engineering School Road"
          },
          {
            "id": "ber-4",
            "name": "Ward 4 \u2013 Kamapalli"
          },
          {
            "id": "ber-5",
            "name": "Ward 5 \u2013 Hillpatna"
          }
        ]
      },
      {
        "id": "sambalpur",
        "name": "Sambalpur",
        "wards": [
          {
            "id": "sbp-1",
            "name": "Ward 1 \u2013 Dhanupali"
          },
          {
            "id": "sbp-2",
            "name": "Ward 2 \u2013 Budharaja"
          },
          {
            "id": "sbp-3",
            "name": "Ward 3 \u2013 Khetrajpur"
          },
          {
            "id": "sbp-4",
            "name": "Ward 4 \u2013 Bareipali"
          },
          {
            "id": "sbp-5",
            "name": "Ward 5 \u2013 Ainthapali"
          }
        ]
      }
    ]
  },
  {
    "id": "punjab",
    "name": "Punjab",
    "districts": [
      {
        "id": "ludhiana",
        "name": "Ludhiana",
        "wards": [
          {
            "id": "ldh-1",
            "name": "Ward 1 \u2013 Model Town"
          },
          {
            "id": "ldh-2",
            "name": "Ward 2 \u2013 Sarabha Nagar"
          },
          {
            "id": "ldh-3",
            "name": "Ward 3 \u2013 Ferozepur Road"
          },
          {
            "id": "ldh-4",
            "name": "Ward 4 \u2013 Civil Lines"
          },
          {
            "id": "ldh-5",
            "name": "Ward 5 \u2013 BRS Nagar"
          }
        ]
      },
      {
        "id": "amritsar",
        "name": "Amritsar",
        "wards": [
          {
            "id": "asr-1",
            "name": "Ward 1 \u2013 Heritage Street"
          },
          {
            "id": "asr-2",
            "name": "Ward 2 \u2013 Ranjit Avenue"
          },
          {
            "id": "asr-3",
            "name": "Ward 3 \u2013 Lawrence Road"
          },
          {
            "id": "asr-4",
            "name": "Ward 4 \u2013 Mall Road"
          },
          {
            "id": "asr-5",
            "name": "Ward 5 \u2013 Majitha Road"
          }
        ]
      },
      {
        "id": "jalandhar",
        "name": "Jalandhar",
        "wards": [
          {
            "id": "jal-1",
            "name": "Ward 1 \u2013 Model Town"
          },
          {
            "id": "jal-2",
            "name": "Ward 2 \u2013 Urban Estate Phase 2"
          },
          {
            "id": "jal-3",
            "name": "Ward 3 \u2013 BMC Chowk"
          },
          {
            "id": "jal-4",
            "name": "Ward 4 \u2013 Rama Mandi"
          },
          {
            "id": "jal-5",
            "name": "Ward 5 \u2013 Cantt Road"
          }
        ]
      },
      {
        "id": "patiala",
        "name": "Patiala",
        "wards": [
          {
            "id": "ptl-1",
            "name": "Ward 1 \u2013 Leela Bhawan"
          },
          {
            "id": "ptl-2",
            "name": "Ward 2 \u2013 Model Town"
          },
          {
            "id": "ptl-3",
            "name": "Ward 3 \u2013 Urban Estate Phase 1"
          },
          {
            "id": "ptl-4",
            "name": "Ward 4 \u2013 Baradari"
          },
          {
            "id": "ptl-5",
            "name": "Ward 5 \u2013 Tripuri"
          }
        ]
      },
      {
        "id": "bathinda",
        "name": "Bathinda",
        "wards": [
          {
            "id": "bth-1",
            "name": "Ward 1 \u2013 Mall Road"
          },
          {
            "id": "bth-2",
            "name": "Ward 2 \u2013 Model Town Phase 1"
          },
          {
            "id": "bth-3",
            "name": "Ward 3 \u2013 Thermal Colony"
          },
          {
            "id": "bth-4",
            "name": "Ward 4 \u2013 GT Road"
          },
          {
            "id": "bth-5",
            "name": "Ward 5 \u2013 Power House Road"
          }
        ]
      }
    ]
  },
  {
    "id": "rajasthan",
    "name": "Rajasthan",
    "districts": [
      {
        "id": "jaipur",
        "name": "Jaipur",
        "wards": [
          {
            "id": "jpr-1",
            "name": "Ward 1 \u2013 Malviya Nagar"
          },
          {
            "id": "jpr-2",
            "name": "Ward 2 \u2013 Vaishali Nagar"
          },
          {
            "id": "jpr-3",
            "name": "Ward 3 \u2013 Mansarovar"
          },
          {
            "id": "jpr-4",
            "name": "Ward 4 \u2013 C-Scheme"
          },
          {
            "id": "jpr-5",
            "name": "Ward 5 \u2013 Raja Park"
          }
        ]
      },
      {
        "id": "jodhpur",
        "name": "Jodhpur",
        "wards": [
          {
            "id": "jdh-1",
            "name": "Ward 1 \u2013 Shastri Nagar"
          },
          {
            "id": "jdh-2",
            "name": "Ward 2 \u2013 Ratanada"
          },
          {
            "id": "jdh-3",
            "name": "Ward 3 \u2013 Sardarpura"
          },
          {
            "id": "jdh-4",
            "name": "Ward 4 \u2013 Paota"
          },
          {
            "id": "jdh-5",
            "name": "Ward 5 \u2013 Pal Road"
          }
        ]
      },
      {
        "id": "kota",
        "name": "Kota",
        "wards": [
          {
            "id": "kta-1",
            "name": "Ward 1 \u2013 Talwandi"
          },
          {
            "id": "kta-2",
            "name": "Ward 2 \u2013 Vigyan Nagar"
          },
          {
            "id": "kta-3",
            "name": "Ward 3 \u2013 Dadabari"
          },
          {
            "id": "kta-4",
            "name": "Ward 4 \u2013 Mahaveer Nagar"
          },
          {
            "id": "kta-5",
            "name": "Ward 5 \u2013 Gumanpura"
          }
        ]
      },
      {
        "id": "udaipur",
        "name": "Udaipur",
        "wards": [
          {
            "id": "udp-1",
            "name": "Ward 1 \u2013 Fatehsagar Lake Area"
          },
          {
            "id": "udp-2",
            "name": "Ward 2 \u2013 Panchwati"
          },
          {
            "id": "udp-3",
            "name": "Ward 3 \u2013 Hiran Magri Sector 4"
          },
          {
            "id": "udp-4",
            "name": "Ward 4 \u2013 Chetak Circle"
          },
          {
            "id": "udp-5",
            "name": "Ward 5 \u2013 Madhuban"
          }
        ]
      },
      {
        "id": "bikaner",
        "name": "Bikaner",
        "wards": [
          {
            "id": "bkn-1",
            "name": "Ward 1 \u2013 Kote Gate"
          },
          {
            "id": "bkn-2",
            "name": "Ward 2 \u2013 Sadul Colony"
          },
          {
            "id": "bkn-3",
            "name": "Ward 3 \u2013 Jai Narayan Vyas Colony"
          },
          {
            "id": "bkn-4",
            "name": "Ward 4 \u2013 Gangashahar"
          },
          {
            "id": "bkn-5",
            "name": "Ward 5 \u2013 Rani Bazaar"
          }
        ]
      }
    ]
  },
  {
    "id": "sikkim",
    "name": "Sikkim",
    "districts": [
      {
        "id": "gangtok",
        "name": "Gangtok",
        "wards": [
          {
            "id": "gtk-1",
            "name": "Ward 1 \u2013 MG Marg"
          },
          {
            "id": "gtk-2",
            "name": "Ward 2 \u2013 Deorali"
          },
          {
            "id": "gtk-3",
            "name": "Ward 3 \u2013 Tadong"
          },
          {
            "id": "gtk-4",
            "name": "Ward 4 \u2013 Arithang"
          },
          {
            "id": "gtk-5",
            "name": "Ward 5 \u2013 Development Area"
          }
        ]
      },
      {
        "id": "namchi",
        "name": "Namchi",
        "wards": [
          {
            "id": "nam-1",
            "name": "Ward 1 \u2013 Central Park"
          },
          {
            "id": "nam-2",
            "name": "Ward 2 \u2013 Char Dham Road"
          },
          {
            "id": "nam-3",
            "name": "Ward 3 \u2013 Boomtar"
          },
          {
            "id": "nam-4",
            "name": "Ward 4 \u2013 Purano Namchi"
          },
          {
            "id": "nam-5",
            "name": "Ward 5 \u2013 Assangthang"
          }
        ]
      },
      {
        "id": "gyalshing",
        "name": "Gyalshing (Geyzing)",
        "wards": [
          {
            "id": "gyz-1",
            "name": "Ward 1 \u2013 Geyzing Bazaar"
          },
          {
            "id": "gyz-2",
            "name": "Ward 2 \u2013 Pelling Road"
          },
          {
            "id": "gyz-3",
            "name": "Ward 3 \u2013 Kyongsa"
          },
          {
            "id": "gyz-4",
            "name": "Ward 4 \u2013 Tikjuk"
          },
          {
            "id": "gyz-5",
            "name": "Ward 5 \u2013 Lingchom"
          }
        ]
      },
      {
        "id": "mangan",
        "name": "Mangan",
        "wards": [
          {
            "id": "mgn-1",
            "name": "Ward 1 \u2013 Mangan Bazaar"
          },
          {
            "id": "mgn-2",
            "name": "Ward 2 \u2013 Power Colony"
          },
          {
            "id": "mgn-3",
            "name": "Ward 3 \u2013 Pentok"
          },
          {
            "id": "mgn-4",
            "name": "Ward 4 \u2013 Singhik"
          },
          {
            "id": "mgn-5",
            "name": "Ward 5 \u2013 Malling"
          }
        ]
      },
      {
        "id": "pakyong",
        "name": "Pakyong",
        "wards": [
          {
            "id": "pky-1",
            "name": "Ward 1 \u2013 Airport Road"
          },
          {
            "id": "pky-2",
            "name": "Ward 2 \u2013 Pakyong Bazaar"
          },
          {
            "id": "pky-3",
            "name": "Ward 3 \u2013 Dikling"
          },
          {
            "id": "pky-4",
            "name": "Ward 4 \u2013 Bering"
          },
          {
            "id": "pky-5",
            "name": "Ward 5 \u2013 Rhenock Road"
          }
        ]
      }
    ]
  },
  {
    "id": "tamil-nadu",
    "name": "Tamil Nadu",
    "districts": [
      {
        "id": "chennai",
        "name": "Chennai (Greater Chennai Corporation)",
        "wards": generateChennaiWards()
      },
      {
        "id": "coimbatore",
        "name": "Coimbatore",
        "wards": [
          {
            "id": "cbe-1",
            "name": "Ward 1 \u2013 RS Puram"
          },
          {
            "id": "cbe-2",
            "name": "Ward 2 \u2013 Gandhipuram"
          },
          {
            "id": "cbe-3",
            "name": "Ward 3 \u2013 Peelamedu"
          },
          {
            "id": "cbe-4",
            "name": "Ward 4 \u2013 Saibaba Colony"
          },
          {
            "id": "cbe-5",
            "name": "Ward 5 \u2013 Singanallur"
          }
        ]
      },
      {
        "id": "madurai",
        "name": "Madurai",
        "wards": [
          {
            "id": "mdu-1",
            "name": "Ward 1 \u2013 Anna Nagar"
          },
          {
            "id": "mdu-2",
            "name": "Ward 2 \u2013 KK Nagar"
          },
          {
            "id": "mdu-3",
            "name": "Ward 3 \u2013 Mattuthavani"
          },
          {
            "id": "mdu-4",
            "name": "Ward 4 \u2013 Simmakkal"
          },
          {
            "id": "mdu-5",
            "name": "Ward 5 \u2013 Goripalayam"
          }
        ]
      },
      {
        "id": "tiruchirappalli",
        "name": "Tiruchirappalli (Trichy)",
        "wards": [
          {
            "id": "try-1",
            "name": "Ward 1 \u2013 Thillai Nagar"
          },
          {
            "id": "try-2",
            "name": "Ward 2 \u2013 Srirangam"
          },
          {
            "id": "try-3",
            "name": "Ward 3 \u2013 Cantonment"
          },
          {
            "id": "try-4",
            "name": "Ward 4 \u2013 K.K. Nagar"
          },
          {
            "id": "try-5",
            "name": "Ward 5 \u2013 Palakkarai"
          }
        ]
      },
      {
        "id": "salem",
        "name": "Salem",
        "wards": [
          {
            "id": "slm-1",
            "name": "Ward 1 \u2013 Fairlands"
          },
          {
            "id": "slm-2",
            "name": "Ward 2 \u2013 Alagapuram"
          },
          {
            "id": "slm-3",
            "name": "Ward 3 \u2013 Hasthampatti"
          },
          {
            "id": "slm-4",
            "name": "Ward 4 \u2013 Suramangalam"
          },
          {
            "id": "slm-5",
            "name": "Ward 5 \u2013 Shevapet"
          }
        ]
      }
    ]
  },
  {
    "id": "telangana",
    "name": "Telangana",
    "districts": [
      {
        "id": "hyderabad",
        "name": "Hyderabad (GHMC)",
        "wards": [
          {
            "id": "hyd-1",
            "name": "Ward 1 \u2013 Banjara Hills"
          },
          {
            "id": "hyd-2",
            "name": "Ward 2 \u2013 Jubilee Hills"
          },
          {
            "id": "hyd-3",
            "name": "Ward 3 \u2013 Hitec City / Madhapur"
          },
          {
            "id": "hyd-4",
            "name": "Ward 4 \u2013 Gachibowli"
          },
          {
            "id": "hyd-5",
            "name": "Ward 5 \u2013 Kukatpally"
          }
        ]
      },
      {
        "id": "warangal",
        "name": "Warangal (GWMC)",
        "wards": [
          {
            "id": "wgl-1",
            "name": "Ward 1 \u2013 Hanamkonda"
          },
          {
            "id": "wgl-2",
            "name": "Ward 2 \u2013 Kazipet"
          },
          {
            "id": "wgl-3",
            "name": "Ward 3 \u2013 Nayeem Nagar"
          },
          {
            "id": "wgl-4",
            "name": "Ward 4 \u2013 Subedari"
          },
          {
            "id": "wgl-5",
            "name": "Ward 5 \u2013 Kishanpura"
          }
        ]
      },
      {
        "id": "nizamabad",
        "name": "Nizamabad",
        "wards": [
          {
            "id": "nzb-1",
            "name": "Ward 1 \u2013 Khaleelwadi"
          },
          {
            "id": "nzb-2",
            "name": "Ward 2 \u2013 Subhashnagar"
          },
          {
            "id": "nzb-3",
            "name": "Ward 3 \u2013 Vinayak Nagar"
          },
          {
            "id": "nzb-4",
            "name": "Ward 4 \u2013 Kanteshwar"
          },
          {
            "id": "nzb-5",
            "name": "Ward 5 \u2013 Goutham Nagar"
          }
        ]
      },
      {
        "id": "karimnagar",
        "name": "Karimnagar",
        "wards": [
          {
            "id": "krm-1",
            "name": "Ward 1 \u2013 Mukarrampura"
          },
          {
            "id": "krm-2",
            "name": "Ward 2 \u2013 Collectorate Area"
          },
          {
            "id": "krm-3",
            "name": "Ward 3 \u2013 Bhagathnagar"
          },
          {
            "id": "krm-4",
            "name": "Ward 4 \u2013 Mankammathota"
          },
          {
            "id": "krm-5",
            "name": "Ward 5 \u2013 Vidyanagar"
          }
        ]
      },
      {
        "id": "khammam",
        "name": "Khammam",
        "wards": [
          {
            "id": "kmm-1",
            "name": "Ward 1 \u2013 Wyra Road"
          },
          {
            "id": "kmm-2",
            "name": "Ward 2 \u2013 Mamillagudem"
          },
          {
            "id": "kmm-3",
            "name": "Ward 3 \u2013 Rotary Nagar"
          },
          {
            "id": "kmm-4",
            "name": "Ward 4 \u2013 Bank Colony"
          },
          {
            "id": "kmm-5",
            "name": "Ward 5 \u2013 Khanapuram"
          }
        ]
      }
    ]
  },
  {
    "id": "tripura",
    "name": "Tripura",
    "districts": [
      {
        "id": "west-tripura",
        "name": "West Tripura (Agartala)",
        "wards": [
          {
            "id": "agt-1",
            "name": "Ward 1 \u2013 Banamalipur"
          },
          {
            "id": "agt-2",
            "name": "Ward 2 \u2013 Ramnagar"
          },
          {
            "id": "agt-3",
            "name": "Ward 3 \u2013 Krishnanagar"
          },
          {
            "id": "agt-4",
            "name": "Ward 4 \u2013 Dhaleswar"
          },
          {
            "id": "agt-5",
            "name": "Ward 5 \u2013 Radhanagar"
          }
        ]
      },
      {
        "id": "north-tripura",
        "name": "North Tripura (Dharmanagar)",
        "wards": [
          {
            "id": "dhm-1",
            "name": "Ward 1 \u2013 Dighi Road"
          },
          {
            "id": "dhm-2",
            "name": "Ward 2 \u2013 Nayapara"
          },
          {
            "id": "dhm-3",
            "name": "Ward 3 \u2013 Rajbari"
          },
          {
            "id": "dhm-4",
            "name": "Ward 4 \u2013 Dewanpasa"
          },
          {
            "id": "dhm-5",
            "name": "Ward 5 \u2013 Sanicherra"
          }
        ]
      },
      {
        "id": "gomati",
        "name": "Gomati (Udaipur)",
        "wards": [
          {
            "id": "udp-t-1",
            "name": "Ward 1 \u2013 Matabari"
          },
          {
            "id": "udp-t-2",
            "name": "Ward 2 \u2013 Radhakishorepur"
          },
          {
            "id": "udp-t-3",
            "name": "Ward 3 \u2013 Central Road"
          },
          {
            "id": "udp-t-4",
            "name": "Ward 4 \u2013 Jamjuri"
          },
          {
            "id": "udp-t-5",
            "name": "Ward 5 \u2013 Bagafa"
          }
        ]
      },
      {
        "id": "unakoti",
        "name": "Unakoti (Kailashahar)",
        "wards": [
          {
            "id": "kls-1",
            "name": "Ward 1 \u2013 Gobindapur"
          },
          {
            "id": "kls-2",
            "name": "Ward 2 \u2013 Paiturbazar"
          },
          {
            "id": "kls-3",
            "name": "Ward 3 \u2013 Kubjhar"
          },
          {
            "id": "kls-4",
            "name": "Ward 4 \u2013 Srinagar"
          },
          {
            "id": "kls-5",
            "name": "Ward 5 \u2013 Chhantail"
          }
        ]
      },
      {
        "id": "south-tripura",
        "name": "South Tripura (Belonia)",
        "wards": [
          {
            "id": "bln-1",
            "name": "Ward 1 \u2013 Belonia Bazaar"
          },
          {
            "id": "bln-2",
            "name": "Ward 2 \u2013 Bankar"
          },
          {
            "id": "bln-3",
            "name": "Ward 3 \u2013 Barpathari"
          },
          {
            "id": "bln-4",
            "name": "Ward 4 \u2013 Rajnagar"
          },
          {
            "id": "bln-5",
            "name": "Ward 5 \u2013 Hrishyamukh"
          }
        ]
      }
    ]
  },
  {
    "id": "uttar-pradesh",
    "name": "Uttar Pradesh",
    "districts": [
      {
        "id": "lucknow",
        "name": "Lucknow",
        "wards": [
          {
            "id": "lko-1",
            "name": "Ward 1 \u2013 Hazratganj"
          },
          {
            "id": "lko-2",
            "name": "Ward 2 \u2013 Gomti Nagar"
          },
          {
            "id": "lko-3",
            "name": "Ward 3 \u2013 Aliganj"
          },
          {
            "id": "lko-4",
            "name": "Ward 4 \u2013 Indira Nagar"
          },
          {
            "id": "lko-5",
            "name": "Ward 5 \u2013 Mahanagar"
          }
        ]
      },
      {
        "id": "kanpur-nagar",
        "name": "Kanpur",
        "wards": [
          {
            "id": "knp-1",
            "name": "Ward 1 \u2013 Civil Lines"
          },
          {
            "id": "knp-2",
            "name": "Ward 2 \u2013 Swaroop Nagar"
          },
          {
            "id": "knp-3",
            "name": "Ward 3 \u2013 Kakadeo"
          },
          {
            "id": "knp-4",
            "name": "Ward 4 \u2013 Govind Nagar"
          },
          {
            "id": "knp-5",
            "name": "Ward 5 \u2013 Kidwai Nagar"
          }
        ]
      },
      {
        "id": "varanasi",
        "name": "Varanasi",
        "wards": [
          {
            "id": "vns-1",
            "name": "Ward 1 \u2013 Godowlia / Dashashwamedh"
          },
          {
            "id": "vns-2",
            "name": "Ward 2 \u2013 Lanka (BHU)"
          },
          {
            "id": "vns-3",
            "name": "Ward 3 \u2013 Sigra"
          },
          {
            "id": "vns-4",
            "name": "Ward 4 \u2013 Cantt Road"
          },
          {
            "id": "vns-5",
            "name": "Ward 5 \u2013 Assi Ghat Area"
          }
        ]
      },
      {
        "id": "agra",
        "name": "Agra",
        "wards": [
          {
            "id": "agr-1",
            "name": "Ward 1 \u2013 Tajganj"
          },
          {
            "id": "agr-2",
            "name": "Ward 2 \u2013 Sanjay Place"
          },
          {
            "id": "agr-3",
            "name": "Ward 3 \u2013 Civil Lines"
          },
          {
            "id": "agr-4",
            "name": "Ward 4 \u2013 Kamla Nagar"
          },
          {
            "id": "agr-5",
            "name": "Ward 5 \u2013 Dayalbagh"
          }
        ]
      },
      {
        "id": "prayagraj",
        "name": "Prayagraj (Allahabad)",
        "wards": [
          {
            "id": "pry-1",
            "name": "Ward 1 \u2013 Civil Lines"
          },
          {
            "id": "pry-2",
            "name": "Ward 2 \u2013 Katra"
          },
          {
            "id": "pry-3",
            "name": "Ward 3 \u2013 Georgetown"
          },
          {
            "id": "pry-4",
            "name": "Ward 4 \u2013 Tagore Town"
          },
          {
            "id": "pry-5",
            "name": "Ward 5 \u2013 Sangam Area"
          }
        ]
      }
    ]
  },
  {
    "id": "uttarakhand",
    "name": "Uttarakhand",
    "districts": [
      {
        "id": "dehradun",
        "name": "Dehradun",
        "wards": [
          {
            "id": "ddn-1",
            "name": "Ward 1 \u2013 Rajpur Road"
          },
          {
            "id": "ddn-2",
            "name": "Ward 2 \u2013 Clock Tower / Paltan Bazar"
          },
          {
            "id": "ddn-3",
            "name": "Ward 3 \u2013 Jakhan"
          },
          {
            "id": "ddn-4",
            "name": "Ward 4 \u2013 Ballupur"
          },
          {
            "id": "ddn-5",
            "name": "Ward 5 \u2013 Clement Town"
          }
        ]
      },
      {
        "id": "haridwar",
        "name": "Haridwar",
        "wards": [
          {
            "id": "hdw-1",
            "name": "Ward 1 \u2013 Har Ki Pauri"
          },
          {
            "id": "hdw-2",
            "name": "Ward 2 \u2013 Ranipur More"
          },
          {
            "id": "hdw-3",
            "name": "Ward 3 \u2013 Jwalapur"
          },
          {
            "id": "hdw-4",
            "name": "Ward 4 \u2013 Kankhal"
          },
          {
            "id": "hdw-5",
            "name": "Ward 5 \u2013 BHEL Township"
          }
        ]
      },
      {
        "id": "roorkee",
        "name": "Roorkee",
        "wards": [
          {
            "id": "rke-1",
            "name": "Ward 1 \u2013 Civil Lines"
          },
          {
            "id": "rke-2",
            "name": "Ward 2 \u2013 IIT Roorkee Area"
          },
          {
            "id": "rke-3",
            "name": "Ward 3 \u2013 Ramnagar"
          },
          {
            "id": "rke-4",
            "name": "Ward 4 \u2013 Malviya Chowk"
          },
          {
            "id": "rke-5",
            "name": "Ward 5 \u2013 Ganeshpur"
          }
        ]
      },
      {
        "id": "nainital",
        "name": "Nainital (Haldwani)",
        "wards": [
          {
            "id": "hld-1",
            "name": "Ward 1 \u2013 Mallital (Nainital)"
          },
          {
            "id": "hld-2",
            "name": "Ward 2 \u2013 Tallital"
          },
          {
            "id": "hld-3",
            "name": "Ward 3 \u2013 Haldwani Main Market"
          },
          {
            "id": "hld-4",
            "name": "Ward 4 \u2013 Kaladhungi Road"
          },
          {
            "id": "hld-5",
            "name": "Ward 5 \u2013 Kathgodam"
          }
        ]
      },
      {
        "id": "rishikesh",
        "name": "Rishikesh",
        "wards": [
          {
            "id": "rsk-1",
            "name": "Ward 1 \u2013 Triveni Ghat"
          },
          {
            "id": "rsk-2",
            "name": "Ward 2 \u2013 Tapovan"
          },
          {
            "id": "rsk-3",
            "name": "Ward 3 \u2013 Laxman Jhula Road"
          },
          {
            "id": "rsk-4",
            "name": "Ward 4 \u2013 Muni Ki Reti"
          },
          {
            "id": "rsk-5",
            "name": "Ward 5 \u2013 Dhalwala"
          }
        ]
      }
    ]
  },
  {
    "id": "west-bengal",
    "name": "West Bengal",
    "districts": [
      {
        "id": "kolkata",
        "name": "Kolkata (KMC)",
        "wards": [
          {
            "id": "kol-1",
            "name": "Ward 1 \u2013 Park Street / Chowringhee"
          },
          {
            "id": "kol-2",
            "name": "Ward 2 \u2013 Salt Lake (Bidhannagar)"
          },
          {
            "id": "kol-3",
            "name": "Ward 3 \u2013 New Town / Rajarhat"
          },
          {
            "id": "kol-4",
            "name": "Ward 4 \u2013 Ballygunge"
          },
          {
            "id": "kol-5",
            "name": "Ward 5 \u2013 Shyambazar"
          }
        ]
      },
      {
        "id": "howrah",
        "name": "Howrah",
        "wards": [
          {
            "id": "hwh-1",
            "name": "Ward 1 \u2013 Howrah Station Area"
          },
          {
            "id": "hwh-2",
            "name": "Ward 2 \u2013 Shibpur"
          },
          {
            "id": "hwh-3",
            "name": "Ward 3 \u2013 Salkia"
          },
          {
            "id": "hwh-4",
            "name": "Ward 4 \u2013 Liluah"
          },
          {
            "id": "hwh-5",
            "name": "Ward 5 \u2013 Mandirtala"
          }
        ]
      },
      {
        "id": "darjeeling",
        "name": "Darjeeling (Siliguri)",
        "wards": [
          {
            "id": "slg-1",
            "name": "Ward 1 \u2013 Mall Road (Darjeeling)"
          },
          {
            "id": "slg-2",
            "name": "Ward 2 \u2013 Hill Cart Road (Siliguri)"
          },
          {
            "id": "slg-3",
            "name": "Ward 3 \u2013 Sevoke Road"
          },
          {
            "id": "slg-4",
            "name": "Ward 4 \u2013 Pradhan Nagar"
          },
          {
            "id": "slg-5",
            "name": "Ward 5 \u2013 Hakimpara"
          }
        ]
      },
      {
        "id": "paschim-bardhaman",
        "name": "Paschim Bardhaman (Asansol)",
        "wards": [
          {
            "id": "asn-1",
            "name": "Ward 1 \u2013 Burnpur"
          },
          {
            "id": "asn-2",
            "name": "Ward 2 \u2013 Court Area"
          },
          {
            "id": "asn-3",
            "name": "Ward 3 \u2013 Hutton Road"
          },
          {
            "id": "asn-4",
            "name": "Ward 4 \u2013 Ushagram"
          },
          {
            "id": "asn-5",
            "name": "Ward 5 \u2013 Sen Raleigh Road"
          }
        ]
      },
      {
        "id": "durgapur",
        "name": "Durgapur",
        "wards": [
          {
            "id": "dgp-1",
            "name": "Ward 1 \u2013 City Centre"
          },
          {
            "id": "dgp-2",
            "name": "Ward 2 \u2013 Benachity"
          },
          {
            "id": "dgp-3",
            "name": "Ward 3 \u2013 B-Zone"
          },
          {
            "id": "dgp-4",
            "name": "Ward 4 \u2013 Steel Township"
          },
          {
            "id": "dgp-5",
            "name": "Ward 5 \u2013 Muchipara"
          }
        ]
      }
    ]
  },
  {
    "id": "andaman-and-nicobar",
    "name": "Andaman and Nicobar Islands (UT)",
    "districts": [
      {
        "id": "south-andaman",
        "name": "South Andaman (Port Blair)",
        "wards": [
          {
            "id": "an-1",
            "name": "Ward 1 \u2013 Aberdeen Bazaar"
          },
          {
            "id": "an-2",
            "name": "Ward 2 \u2013 Dollygunj"
          },
          {
            "id": "an-3",
            "name": "Ward 3 \u2013 Shadipur"
          },
          {
            "id": "an-4",
            "name": "Ward 4 \u2013 Garacharma"
          },
          {
            "id": "an-5",
            "name": "Ward 5 \u2013 Haddo"
          }
        ]
      },
      {
        "id": "north-middle-andaman",
        "name": "North and Middle Andaman",
        "wards": [
          {
            "id": "nma-1",
            "name": "Ward 1 \u2013 Mayabunder"
          },
          {
            "id": "nma-2",
            "name": "Ward 2 \u2013 Diglipur"
          },
          {
            "id": "nma-3",
            "name": "Ward 3 \u2013 Rangat"
          },
          {
            "id": "nma-4",
            "name": "Ward 4 \u2013 Billiground"
          },
          {
            "id": "nma-5",
            "name": "Ward 5 \u2013 Kadamtala"
          }
        ]
      },
      {
        "id": "nicobar",
        "name": "Nicobar",
        "wards": [
          {
            "id": "nic-1",
            "name": "Ward 1 \u2013 Car Nicobar HQ"
          },
          {
            "id": "nic-2",
            "name": "Ward 2 \u2013 Nancowry"
          },
          {
            "id": "nic-3",
            "name": "Ward 3 \u2013 Campbell Bay"
          },
          {
            "id": "nic-4",
            "name": "Ward 4 \u2013 Katchal"
          },
          {
            "id": "nic-5",
            "name": "Ward 5 \u2013 Kamorta"
          }
        ]
      },
      {
        "id": "swaraj-dweep",
        "name": "Swaraj Dweep (Havelock)",
        "wards": [
          {
            "id": "hlk-1",
            "name": "Ward 1 \u2013 Village No. 1 (Govind Nagar)"
          },
          {
            "id": "hlk-2",
            "name": "Ward 2 \u2013 Village No. 2 (Vijay Nagar)"
          },
          {
            "id": "hlk-3",
            "name": "Ward 3 \u2013 Village No. 3 (Shyam Nagar)"
          },
          {
            "id": "hlk-4",
            "name": "Ward 4 \u2013 Village No. 4 (Radhanagar)"
          },
          {
            "id": "hlk-5",
            "name": "Ward 5 \u2013 Village No. 5 (Krishna Nagar)"
          }
        ]
      },
      {
        "id": "shaheed-dweep",
        "name": "Shaheed Dweep (Neil Island)",
        "wards": [
          {
            "id": "nel-1",
            "name": "Ward 1 \u2013 Bharatpur"
          },
          {
            "id": "nel-2",
            "name": "Ward 2 \u2013 Laxmanpur"
          },
          {
            "id": "nel-3",
            "name": "Ward 3 \u2013 Sitapur"
          },
          {
            "id": "nel-4",
            "name": "Ward 4 \u2013 Ram Nagar"
          },
          {
            "id": "nel-5",
            "name": "Ward 5 \u2013 Neil Kendra"
          }
        ]
      }
    ]
  },
  {
    "id": "chandigarh",
    "name": "Chandigarh (UT)",
    "districts": [
      {
        "id": "chandigarh-central",
        "name": "Chandigarh Central",
        "wards": [
          {
            "id": "chd-1",
            "name": "Ward 1 \u2013 Sector 17 (City Centre)"
          },
          {
            "id": "chd-2",
            "name": "Ward 2 \u2013 Sector 22"
          },
          {
            "id": "chd-3",
            "name": "Ward 3 \u2013 Sector 35"
          },
          {
            "id": "chd-4",
            "name": "Ward 4 \u2013 Sector 9"
          },
          {
            "id": "chd-5",
            "name": "Ward 5 \u2013 Sector 10"
          }
        ]
      },
      {
        "id": "chandigarh-north",
        "name": "Chandigarh North",
        "wards": [
          {
            "id": "chd-n-1",
            "name": "Ward 1 \u2013 Sector 1 (Capitol Complex)"
          },
          {
            "id": "chd-n-2",
            "name": "Ward 2 \u2013 Sector 2"
          },
          {
            "id": "chd-n-3",
            "name": "Ward 3 \u2013 Sector 3"
          },
          {
            "id": "chd-n-4",
            "name": "Ward 4 \u2013 Sector 4"
          },
          {
            "id": "chd-n-5",
            "name": "Ward 5 \u2013 Sector 5 / Sukhna Lake"
          }
        ]
      },
      {
        "id": "chandigarh-south",
        "name": "Chandigarh South",
        "wards": [
          {
            "id": "chd-s-1",
            "name": "Ward 1 \u2013 Sector 43 (ISBT)"
          },
          {
            "id": "chd-s-2",
            "name": "Ward 2 \u2013 Sector 44"
          },
          {
            "id": "chd-s-3",
            "name": "Ward 3 \u2013 Sector 45 (Burail)"
          },
          {
            "id": "chd-s-4",
            "name": "Ward 4 \u2013 Sector 46"
          },
          {
            "id": "chd-s-5",
            "name": "Ward 5 \u2013 Sector 47"
          }
        ]
      },
      {
        "id": "chandigarh-east",
        "name": "Chandigarh East",
        "wards": [
          {
            "id": "chd-e-1",
            "name": "Ward 1 \u2013 Sector 26 (Grain Market)"
          },
          {
            "id": "chd-e-2",
            "name": "Ward 2 \u2013 Sector 27"
          },
          {
            "id": "chd-e-3",
            "name": "Ward 3 \u2013 Sector 28"
          },
          {
            "id": "chd-e-4",
            "name": "Ward 4 \u2013 Sector 19"
          },
          {
            "id": "chd-e-5",
            "name": "Ward 5 \u2013 Manimajra"
          }
        ]
      },
      {
        "id": "chandigarh-west",
        "name": "Chandigarh West",
        "wards": [
          {
            "id": "chd-w-1",
            "name": "Ward 1 \u2013 Sector 37"
          },
          {
            "id": "chd-w-2",
            "name": "Ward 2 \u2013 Sector 38"
          },
          {
            "id": "chd-w-3",
            "name": "Ward 3 \u2013 Sector 39"
          },
          {
            "id": "chd-w-4",
            "name": "Ward 4 \u2013 Sector 40"
          },
          {
            "id": "chd-w-5",
            "name": "Ward 5 \u2013 Sector 41"
          }
        ]
      }
    ]
  },
  {
    "id": "dadra-nagar-haveli-daman-diu",
    "name": "Dadra & Nagar Haveli and Daman & Diu (UT)",
    "districts": [
      {
        "id": "daman",
        "name": "Daman",
        "wards": [
          {
            "id": "dmn-1",
            "name": "Ward 1 \u2013 Nani Daman"
          },
          {
            "id": "dmn-2",
            "name": "Ward 2 \u2013 Moti Daman"
          },
          {
            "id": "dmn-3",
            "name": "Ward 3 \u2013 Devka Beach Area"
          },
          {
            "id": "dmn-4",
            "name": "Ward 4 \u2013 Jampore Beach Area"
          },
          {
            "id": "dmn-5",
            "name": "Ward 5 \u2013 Dunetha"
          }
        ]
      },
      {
        "id": "diu",
        "name": "Diu",
        "wards": [
          {
            "id": "diu-1",
            "name": "Ward 1 \u2013 Main Town & Fort"
          },
          {
            "id": "diu-2",
            "name": "Ward 2 \u2013 Nagoa"
          },
          {
            "id": "diu-3",
            "name": "Ward 3 \u2013 Ghoghla"
          },
          {
            "id": "diu-4",
            "name": "Ward 4 \u2013 Fudam"
          },
          {
            "id": "diu-5",
            "name": "Ward 5 \u2013 Vanakbara"
          }
        ]
      },
      {
        "id": "silvassa",
        "name": "Dadra & Nagar Haveli (Silvassa)",
        "wards": [
          {
            "id": "slv-1",
            "name": "Ward 1 \u2013 Kilwani Road"
          },
          {
            "id": "slv-2",
            "name": "Ward 2 \u2013 Tokarkhada"
          },
          {
            "id": "slv-3",
            "name": "Ward 3 \u2013 Samarvarni"
          },
          {
            "id": "slv-4",
            "name": "Ward 4 \u2013 Amli"
          },
          {
            "id": "slv-5",
            "name": "Ward 5 \u2013 Naroli Road"
          }
        ]
      },
      {
        "id": "dadra",
        "name": "Dadra",
        "wards": [
          {
            "id": "ddr-1",
            "name": "Ward 1 \u2013 Dadra Garden"
          },
          {
            "id": "ddr-2",
            "name": "Ward 2 \u2013 Tembhi"
          },
          {
            "id": "ddr-3",
            "name": "Ward 3 \u2013 Demni Road"
          },
          {
            "id": "ddr-4",
            "name": "Ward 4 \u2013 GIDC Dadra"
          },
          {
            "id": "ddr-5",
            "name": "Ward 5 \u2013 Vapi Border"
          }
        ]
      },
      {
        "id": "khanvel",
        "name": "Khanvel",
        "wards": [
          {
            "id": "khn-1",
            "name": "Ward 1 \u2013 Main Bazaar"
          },
          {
            "id": "khn-2",
            "name": "Ward 2 \u2013 Chauda"
          },
          {
            "id": "khn-3",
            "name": "Ward 3 \u2013 Dudhani Jetty"
          },
          {
            "id": "khn-4",
            "name": "Ward 4 \u2013 Mandoni"
          },
          {
            "id": "khn-5",
            "name": "Ward 5 \u2013 Bindrabin"
          }
        ]
      }
    ]
  },
  {
    "id": "delhi",
    "name": "Delhi (NCT)",
    "districts": [
      {
        "id": "new-delhi",
        "name": "New Delhi (NDMC)",
        "wards": [
          {
            "id": "del-1",
            "name": "Ward 1 \u2013 Connaught Place"
          },
          {
            "id": "del-2",
            "name": "Ward 2 \u2013 Chanakyapuri"
          },
          {
            "id": "del-3",
            "name": "Ward 3 \u2013 Jor Bagh / Lodhi Road"
          },
          {
            "id": "del-4",
            "name": "Ward 4 \u2013 Barakhamba"
          },
          {
            "id": "del-5",
            "name": "Ward 5 \u2013 Bengali Market"
          }
        ]
      },
      {
        "id": "south-delhi",
        "name": "South Delhi (MCD)",
        "wards": [
          {
            "id": "del-s-1",
            "name": "Ward 1 \u2013 Hauz Khas"
          },
          {
            "id": "del-s-2",
            "name": "Ward 2 \u2013 Greater Kailash"
          },
          {
            "id": "del-s-3",
            "name": "Ward 3 \u2013 Saket"
          },
          {
            "id": "del-s-4",
            "name": "Ward 4 \u2013 Vasant Kunj"
          },
          {
            "id": "del-s-5",
            "name": "Ward 5 \u2013 Lajpat Nagar"
          }
        ]
      },
      {
        "id": "north-delhi",
        "name": "North Delhi (MCD)",
        "wards": [
          {
            "id": "del-n-1",
            "name": "Ward 1 \u2013 Civil Lines"
          },
          {
            "id": "del-n-2",
            "name": "Ward 2 \u2013 Model Town"
          },
          {
            "id": "del-n-3",
            "name": "Ward 3 \u2013 Rohini Sector 9"
          },
          {
            "id": "del-n-4",
            "name": "Ward 4 \u2013 Pitampura"
          },
          {
            "id": "del-n-5",
            "name": "Ward 5 \u2013 Shalimar Bagh"
          }
        ]
      },
      {
        "id": "east-delhi",
        "name": "East Delhi (MCD)",
        "wards": [
          {
            "id": "del-e-1",
            "name": "Ward 1 \u2013 Mayur Vihar Phase 1"
          },
          {
            "id": "del-e-2",
            "name": "Ward 2 \u2013 Laxmi Nagar"
          },
          {
            "id": "del-e-3",
            "name": "Ward 3 \u2013 Preet Vihar"
          },
          {
            "id": "del-e-4",
            "name": "Ward 4 \u2013 Anand Vihar"
          },
          {
            "id": "del-e-5",
            "name": "Ward 5 \u2013 Patparganj"
          }
        ]
      },
      {
        "id": "west-delhi",
        "name": "West Delhi (MCD)",
        "wards": [
          {
            "id": "del-w-1",
            "name": "Ward 1 \u2013 Rajouri Garden"
          },
          {
            "id": "del-w-2",
            "name": "Ward 2 \u2013 Punjabi Bagh"
          },
          {
            "id": "del-w-3",
            "name": "Ward 3 \u2013 Janakpuri"
          },
          {
            "id": "del-w-4",
            "name": "Ward 4 \u2013 Patel Nagar"
          },
          {
            "id": "del-w-5",
            "name": "Ward 5 \u2013 Tilak Nagar"
          }
        ]
      }
    ]
  },
  {
    "id": "jammu-and-kashmir",
    "name": "Jammu and Kashmir (UT)",
    "districts": [
      {
        "id": "srinagar",
        "name": "Srinagar (SMC)",
        "wards": [
          {
            "id": "srn-1",
            "name": "Ward 1 \u2013 Lal Chowk"
          },
          {
            "id": "srn-2",
            "name": "Ward 2 \u2013 Rajbagh"
          },
          {
            "id": "srn-3",
            "name": "Ward 3 \u2013 Dal Lake / Boulevard"
          },
          {
            "id": "srn-4",
            "name": "Ward 4 \u2013 Karan Nagar"
          },
          {
            "id": "srn-5",
            "name": "Ward 5 \u2013 Batamaloo"
          }
        ]
      },
      {
        "id": "jammu",
        "name": "Jammu (JMC)",
        "wards": [
          {
            "id": "jmu-1",
            "name": "Ward 1 \u2013 Gandhi Nagar"
          },
          {
            "id": "jmu-2",
            "name": "Ward 2 \u2013 Trikuta Nagar"
          },
          {
            "id": "jmu-3",
            "name": "Ward 3 \u2013 Channi Himmat"
          },
          {
            "id": "jmu-4",
            "name": "Ward 4 \u2013 Raghunath Bazaar"
          },
          {
            "id": "jmu-5",
            "name": "Ward 5 \u2013 Janipur"
          }
        ]
      },
      {
        "id": "anantnag",
        "name": "Anantnag",
        "wards": [
          {
            "id": "ant-1",
            "name": "Ward 1 \u2013 KP Road"
          },
          {
            "id": "ant-2",
            "name": "Ward 2 \u2013 Lal Chowk Anantnag"
          },
          {
            "id": "ant-3",
            "name": "Ward 3 \u2013 Mattan Road"
          },
          {
            "id": "ant-4",
            "name": "Ward 4 \u2013 Achabal Adda"
          },
          {
            "id": "ant-5",
            "name": "Ward 5 \u2013 Dialgam"
          }
        ]
      },
      {
        "id": "baramulla",
        "name": "Baramulla",
        "wards": [
          {
            "id": "brm-1",
            "name": "Ward 1 \u2013 Main Town"
          },
          {
            "id": "brm-2",
            "name": "Ward 2 \u2013 Old Town"
          },
          {
            "id": "brm-3",
            "name": "Ward 3 \u2013 Kanispora"
          },
          {
            "id": "brm-4",
            "name": "Ward 4 \u2013 Delina"
          },
          {
            "id": "brm-5",
            "name": "Ward 5 \u2013 Sangrama"
          }
        ]
      },
      {
        "id": "udhampur",
        "name": "Udhampur",
        "wards": [
          {
            "id": "udh-1",
            "name": "Ward 1 \u2013 Main Bazaar"
          },
          {
            "id": "udh-2",
            "name": "Ward 2 \u2013 Dhar Road"
          },
          {
            "id": "udh-3",
            "name": "Ward 3 \u2013 MH Chowk"
          },
          {
            "id": "udh-4",
            "name": "Ward 4 \u2013 Sailan Talab"
          },
          {
            "id": "udh-5",
            "name": "Ward 5 \u2013 Gole Mela"
          }
        ]
      }
    ]
  },
  {
    "id": "ladakh",
    "name": "Ladakh (UT)",
    "districts": [
      {
        "id": "leh",
        "name": "Leh",
        "wards": [
          {
            "id": "leh-1",
            "name": "Ward 1 \u2013 Main Bazaar"
          },
          {
            "id": "leh-2",
            "name": "Ward 2 \u2013 Changspa"
          },
          {
            "id": "leh-3",
            "name": "Ward 3 \u2013 Skara"
          },
          {
            "id": "leh-4",
            "name": "Ward 4 \u2013 Choglamsar"
          },
          {
            "id": "leh-5",
            "name": "Ward 5 \u2013 Shanti Stupa Road"
          }
        ]
      },
      {
        "id": "kargil",
        "name": "Kargil",
        "wards": [
          {
            "id": "krg-1",
            "name": "Ward 1 \u2013 Main Market"
          },
          {
            "id": "krg-2",
            "name": "Ward 2 \u2013 Baroo"
          },
          {
            "id": "krg-3",
            "name": "Ward 3 \u2013 Biamathang"
          },
          {
            "id": "krg-4",
            "name": "Ward 4 \u2013 Titichumik"
          },
          {
            "id": "krg-5",
            "name": "Ward 5 \u2013 Poyen"
          }
        ]
      },
      {
        "id": "nubra",
        "name": "Nubra Valley",
        "wards": [
          {
            "id": "nub-1",
            "name": "Ward 1 \u2013 Diskit HQ"
          },
          {
            "id": "nub-2",
            "name": "Ward 2 \u2013 Hunder Sand Dunes"
          },
          {
            "id": "nub-3",
            "name": "Ward 3 \u2013 Sumur"
          },
          {
            "id": "nub-4",
            "name": "Ward 4 \u2013 Panamik"
          },
          {
            "id": "nub-5",
            "name": "Ward 5 \u2013 Turtuk"
          }
        ]
      },
      {
        "id": "zanskar",
        "name": "Zanskar",
        "wards": [
          {
            "id": "znk-1",
            "name": "Ward 1 \u2013 Padum Main Town"
          },
          {
            "id": "znk-2",
            "name": "Ward 2 \u2013 Karsha"
          },
          {
            "id": "znk-3",
            "name": "Ward 3 \u2013 Sani"
          },
          {
            "id": "znk-4",
            "name": "Ward 4 \u2013 Zangla"
          },
          {
            "id": "znk-5",
            "name": "Ward 5 \u2013 Pipiting"
          }
        ]
      },
      {
        "id": "dras",
        "name": "Dras",
        "wards": [
          {
            "id": "drs-1",
            "name": "Ward 1 \u2013 Dras Town"
          },
          {
            "id": "drs-2",
            "name": "Ward 2 \u2013 Tololing Foothills"
          },
          {
            "id": "drs-3",
            "name": "Ward 3 \u2013 Bhimbat"
          },
          {
            "id": "drs-4",
            "name": "Ward 4 \u2013 Goshan"
          },
          {
            "id": "drs-5",
            "name": "Ward 5 \u2013 Pandrass"
          }
        ]
      }
    ]
  },
  {
    "id": "lakshadweep",
    "name": "Lakshadweep (UT)",
    "districts": [
      {
        "id": "kavaratti",
        "name": "Kavaratti (HQ)",
        "wards": [
          {
            "id": "kvr-1",
            "name": "Ward 1 \u2013 Secretariat Area"
          },
          {
            "id": "kvr-2",
            "name": "Ward 2 \u2013 Beach Road South"
          },
          {
            "id": "kvr-3",
            "name": "Ward 3 \u2013 Ujra Mosque Area"
          },
          {
            "id": "kvr-4",
            "name": "Ward 4 \u2013 Jetty Terminal"
          },
          {
            "id": "kvr-5",
            "name": "Ward 5 \u2013 North Coast"
          }
        ]
      },
      {
        "id": "agatti",
        "name": "Agatti",
        "wards": [
          {
            "id": "agt-l-1",
            "name": "Ward 1 \u2013 Airport Road"
          },
          {
            "id": "agt-l-2",
            "name": "Ward 2 \u2013 Main Lagoon View"
          },
          {
            "id": "agt-l-3",
            "name": "Ward 3 \u2013 Eastern Jetty"
          },
          {
            "id": "agt-l-4",
            "name": "Ward 4 \u2013 North Village"
          },
          {
            "id": "agt-l-5",
            "name": "Ward 5 \u2013 South Village"
          }
        ]
      },
      {
        "id": "amini",
        "name": "Amini",
        "wards": [
          {
            "id": "amn-1",
            "name": "Ward 1 \u2013 Central Bazaar"
          },
          {
            "id": "amn-2",
            "name": "Ward 2 \u2013 Western Seashore"
          },
          {
            "id": "amn-3",
            "name": "Ward 3 \u2013 Eastern Jetty"
          },
          {
            "id": "amn-4",
            "name": "Ward 4 \u2013 Hospital Road"
          },
          {
            "id": "amn-5",
            "name": "Ward 5 \u2013 South Point"
          }
        ]
      },
      {
        "id": "andrott",
        "name": "Andrott",
        "wards": [
          {
            "id": "and-1",
            "name": "Ward 1 \u2013 Saint Ubaidullah Shrine"
          },
          {
            "id": "and-2",
            "name": "Ward 2 \u2013 Light House Area"
          },
          {
            "id": "and-3",
            "name": "Ward 3 \u2013 Main Bazaar"
          },
          {
            "id": "and-4",
            "name": "Ward 4 \u2013 West Settlement"
          },
          {
            "id": "and-5",
            "name": "Ward 5 \u2013 East End"
          }
        ]
      },
      {
        "id": "minicoy",
        "name": "Minicoy",
        "wards": [
          {
            "id": "mnc-1",
            "name": "Ward 1 \u2013 Lighthouse Area"
          },
          {
            "id": "mnc-2",
            "name": "Ward 2 \u2013 Viringili Point"
          },
          {
            "id": "mnc-3",
            "name": "Ward 3 \u2013 Sedivalu"
          },
          {
            "id": "mnc-4",
            "name": "Ward 4 \u2013 Rammedu"
          },
          {
            "id": "mnc-5",
            "name": "Ward 5 \u2013 Kudehi"
          }
        ]
      }
    ]
  },
  {
    "id": "puducherry",
    "name": "Puducherry (UT)",
    "districts": [
      {
        "id": "puducherry-city",
        "name": "Puducherry (City)",
        "wards": [
          {
            "id": "pdy-1",
            "name": "Ward 1 \u2013 White Town / Promenade Beach"
          },
          {
            "id": "pdy-2",
            "name": "Ward 2 \u2013 Heritage French Quarter"
          },
          {
            "id": "pdy-3",
            "name": "Ward 3 \u2013 Muthialpet"
          },
          {
            "id": "pdy-4",
            "name": "Ward 4 \u2013 Goubert Market"
          },
          {
            "id": "pdy-5",
            "name": "Ward 5 \u2013 Rainbow Nagar"
          }
        ]
      },
      {
        "id": "oulgaret",
        "name": "Oulgaret (Puducherry Suburban)",
        "wards": [
          {
            "id": "olg-1",
            "name": "Ward 1 \u2013 Lawspet"
          },
          {
            "id": "olg-2",
            "name": "Ward 2 \u2013 Reddiarpalayam"
          },
          {
            "id": "olg-3",
            "name": "Ward 3 \u2013 Saram"
          },
          {
            "id": "olg-4",
            "name": "Ward 4 \u2013 Villianur Road"
          },
          {
            "id": "olg-5",
            "name": "Ward 5 \u2013 Thattanchavady"
          }
        ]
      },
      {
        "id": "karaikal",
        "name": "Karaikal",
        "wards": [
          {
            "id": "krk-1",
            "name": "Ward 1 \u2013 Beach Road"
          },
          {
            "id": "krk-2",
            "name": "Ward 2 \u2013 Bharathiar Road"
          },
          {
            "id": "krk-3",
            "name": "Ward 3 \u2013 Thirunallar Road"
          },
          {
            "id": "krk-4",
            "name": "Ward 4 \u2013 Kovilpathu"
          },
          {
            "id": "krk-5",
            "name": "Ward 5 \u2013 Kottucherry"
          }
        ]
      },
      {
        "id": "mahe",
        "name": "Mahe",
        "wards": [
          {
            "id": "mah-1",
            "name": "Ward 1 \u2013 Mahe Town"
          },
          {
            "id": "mah-2",
            "name": "Ward 2 \u2013 River Walkway"
          },
          {
            "id": "mah-3",
            "name": "Ward 3 \u2013 Chalakkara"
          },
          {
            "id": "mah-4",
            "name": "Ward 4 \u2013 Pandakkal"
          },
          {
            "id": "mah-5",
            "name": "Ward 5 \u2013 Cherukallayi"
          }
        ]
      },
      {
        "id": "yanam",
        "name": "Yanam",
        "wards": [
          {
            "id": "ynm-1",
            "name": "Ward 1 \u2013 Godavari Riverfront"
          },
          {
            "id": "ynm-2",
            "name": "Ward 2 \u2013 Pillaraya Street"
          },
          {
            "id": "ynm-3",
            "name": "Ward 3 \u2013 Ferry Road"
          },
          {
            "id": "ynm-4",
            "name": "Ward 4 \u2013 Kanakalapeta"
          },
          {
            "id": "ynm-5",
            "name": "Ward 5 \u2013 Agraharam"
          }
        ]
      }
    ]
  }
]
};

export const getStates = (): StateData[] => LOCATION_DATA.states;

export const getDistricts = (stateId: string): DistrictData[] => {
  const state = LOCATION_DATA.states.find((s) => s.id === stateId);
  return state ? state.districts : [];
};

export const getWards = (stateId: string, districtId: string): WardOption[] => {
  const state = LOCATION_DATA.states.find((s) => s.id === stateId);
  if (!state) return [];
  const district = state.districts.find((d) => d.id === districtId);
  return district ? district.wards : [];
};

/**
 * Parses an existing ward name string (e.g. "Ward 117 – Teynampet" or "Ward 1 – Indiranagar")
 * back into stateId, districtId, and formatted ward name.
 */
export const findLocationFromWard = (wardStr?: string): { stateId: string; districtId: string; wardValue: string } => {
  if (!wardStr || !wardStr.trim()) {
    return { stateId: 'tamil-nadu', districtId: 'chennai', wardValue: '' };
  }

  const normalized = wardStr.toLowerCase().replace(/[–—-]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const state of LOCATION_DATA.states) {
    for (const district of state.districts) {
      for (const ward of district.wards) {
        const wardNorm = ward.name.toLowerCase().replace(/[–—-]/g, ' ').replace(/\s+/g, ' ').trim();
        if (wardNorm === normalized || ward.name === wardStr) {
          return {
            stateId: state.id,
            districtId: district.id,
            wardValue: ward.name,
          };
        }
      }
    }
  }

  // If numeric ward number matches in Chennai
  const match = wardStr.match(/ward\s*(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    const chennaiWards = getWards('tamil-nadu', 'chennai');
    const matched = chennaiWards.find((w) => w.name.toLowerCase().startsWith(`ward ${num} `));
    if (matched) {
      return {
        stateId: 'tamil-nadu',
        districtId: 'chennai',
        wardValue: matched.name,
      };
    }
  }

  // Fallback
  return {
    stateId: 'tamil-nadu',
    districtId: 'chennai',
    wardValue: wardStr,
  };
};
