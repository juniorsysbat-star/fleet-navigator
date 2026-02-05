 export interface TrackerModel {
   id: string;
   name: string;
   port: number;
 }
 
 export interface TrackerManufacturer {
   id: string;
   name: string;
   models: TrackerModel[];
 }
 
 export const TRACKER_DATABASE: TrackerManufacturer[] = [
   {
     id: 'coban',
     name: 'Coban / GPS103',
     models: [
       { id: 'gps103', name: 'GPS103', port: 5001 },
       { id: 'gps103a', name: 'GPS103A', port: 5001 },
       { id: 'gps103b', name: 'GPS103B', port: 5001 },
     ],
   },
   {
     id: 'tk-series',
     name: 'TK-Series / Xexun',
     models: [
       { id: 'tk102', name: 'TK102', port: 5002 },
       { id: 'tk103', name: 'TK103', port: 5002 },
       { id: 'tk103-2', name: 'TK103-2', port: 5002 },
       { id: 'tk104', name: 'TK104', port: 5002 },
       { id: 'tk106', name: 'TK106', port: 5002 },
     ],
   },
   {
     id: 'concox',
     name: 'Concox / Jimi',
     models: [
       { id: 'gt06', name: 'GT06', port: 5023 },
       { id: 'gt06n', name: 'GT06N', port: 5023 },
       { id: 'gt06e', name: 'GT06E', port: 5023 },
       { id: 'wetrack', name: 'WeTrack', port: 5023 },
       { id: 'wetrack2', name: 'WeTrack 2', port: 5023 },
       { id: 'crx1', name: 'CRX1', port: 5023 },
       { id: 'crx3', name: 'CRX3', port: 5023 },
       { id: 'jv200', name: 'JV200', port: 5023 },
       { id: 'at4', name: 'AT4', port: 5023 },
     ],
   },
   {
     id: 'teltonika',
     name: 'Teltonika',
     models: [
       { id: 'fmb920', name: 'FMB920', port: 5027 },
       { id: 'fmb120', name: 'FMB120', port: 5027 },
       { id: 'fmb125', name: 'FMB125', port: 5027 },
       { id: 'fmb130', name: 'FMB130', port: 5027 },
       { id: 'fmb140', name: 'FMB140', port: 5027 },
       { id: 'fmc130', name: 'FMC130', port: 5027 },
       { id: 'fmc640', name: 'FMC640', port: 5027 },
       { id: 'fmt100', name: 'FMT100', port: 5027 },
     ],
   },
   {
     id: 'suntech',
     name: 'Suntech',
     models: [
       { id: 'st300', name: 'ST300', port: 5011 },
       { id: 'st310u', name: 'ST310U', port: 5011 },
       { id: 'st340', name: 'ST340', port: 5011 },
       { id: 'st600', name: 'ST600', port: 5011 },
       { id: 'st940', name: 'ST940', port: 5011 },
     ],
   },
   {
     id: 'calamp',
     name: 'CalAmp',
     models: [
       { id: 'lmu', name: 'LMU Series', port: 5082 },
       { id: 'ttux', name: 'TTU-X Series', port: 5082 },
       { id: 'atrack', name: 'A-Track', port: 5082 },
     ],
   },
   {
     id: 'queclink',
     name: 'Queclink',
     models: [
      { id: 'gv300', name: 'GV300', port: 5006 },
      { id: 'gv310', name: 'GV310', port: 5006 },
      { id: 'gv500', name: 'GV500', port: 5006 },
      { id: 'gv55', name: 'GV55', port: 5006 },
      { id: 'gl300', name: 'GL300', port: 5006 },
      { id: 'gl320mg', name: 'GL320MG', port: 5006 },
     ],
   },
   {
     id: 'meitrack',
     name: 'Meitrack',
     models: [
       { id: 't333', name: 'T333', port: 5020 },
       { id: 't366', name: 'T366', port: 5020 },
       { id: 't355', name: 'T355', port: 5020 },
       { id: 'mt90', name: 'MT90', port: 5020 },
     ],
   },
   {
     id: 'ruptela',
     name: 'Ruptela',
     models: [
       { id: 'fm-eco4', name: 'FM-Eco4', port: 5046 },
       { id: 'fm-pro4', name: 'FM-Pro4', port: 5046 },
       { id: 'fm-tco4', name: 'FM-Tco4', port: 5046 },
     ],
   },
   {
     id: 'topflytech',
     name: 'TopFlytech',
     models: [
      { id: 't8806', name: 'T8806', port: 5059 },
      { id: 't8808', name: 'T8808', port: 5059 },
      { id: 'tld1', name: 'TLD1', port: 5059 },
     ],
   },
   {
     id: 'sinotrack',
     name: 'SinoTrack',
     models: [
       { id: 'st901', name: 'ST-901', port: 5023 },
       { id: 'st902', name: 'ST-902', port: 5023 },
       { id: 'st906', name: 'ST-906', port: 5023 },
     ],
   },
   {
     id: 'other',
     name: 'Outro / Genérico',
     models: [
       { id: 'h02', name: 'Protocolo H02', port: 5013 },
      { id: 'tk103', name: 'Protocolo TK103', port: 5013 },
       { id: 'osmand', name: 'OsmAnd App', port: 5055 },
       { id: 'traccar', name: 'Traccar Client', port: 5055 },
      { id: 'generic', name: 'Genérico', port: 5055 },
     ],
   },
 ];
 
 export const getManufacturerById = (id: string) => 
   TRACKER_DATABASE.find(m => m.id === id);
 
 export const getModelById = (manufacturerId: string, modelId: string) => {
   const manufacturer = getManufacturerById(manufacturerId);
   return manufacturer?.models.find(m => m.id === modelId);
 };
 
 export const SERVER_IP = 'rastreamento.seuservidor.com.br';