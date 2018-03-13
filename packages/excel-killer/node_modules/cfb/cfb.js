/* cfb.js (C) 2013-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*jshint eqnull:true */
/*exported CFB */
/*global module, require:false, process:false, Buffer:false, Uint8Array:false */

var Base64 = (function make_b64(){
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	return {
		encode: function(input) {
			var o = "";
			var c1=0, c2=0, c3=0, e1=0, e2=0, e3=0, e4=0;
			for(var i = 0; i < input.length; ) {
				c1 = input.charCodeAt(i++);
				e1 = (c1 >> 2);

				c2 = input.charCodeAt(i++);
				e2 = ((c1 & 3) << 4) | (c2 >> 4);

				c3 = input.charCodeAt(i++);
				e3 = ((c2 & 15) << 2) | (c3 >> 6);
				e4 = (c3 & 63);
				if (isNaN(c2)) { e3 = e4 = 64; }
				else if (isNaN(c3)) { e4 = 64; }
				o += map.charAt(e1) + map.charAt(e2) + map.charAt(e3) + map.charAt(e4);
			}
			return o;
		},
		decode: function b64_decode(input) {
			var o = "";
			var c1=0, c2=0, c3=0, e1=0, e2=0, e3=0, e4=0;
			input = input.replace(/[^\w\+\/\=]/g, "");
			for(var i = 0; i < input.length;) {
				e1 = map.indexOf(input.charAt(i++));
				e2 = map.indexOf(input.charAt(i++));
				c1 = (e1 << 2) | (e2 >> 4);
				o += String.fromCharCode(c1);

				e3 = map.indexOf(input.charAt(i++));
				c2 = ((e2 & 15) << 4) | (e3 >> 2);
				if (e3 !== 64) { o += String.fromCharCode(c2); }

				e4 = map.indexOf(input.charAt(i++));
				c3 = ((e3 & 3) << 6) | e4;
				if (e4 !== 64) { o += String.fromCharCode(c3); }
			}
			return o;
		}
	};
})();
var has_buf = (typeof Buffer !== 'undefined' && typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.node);

function new_raw_buf(len) {
	/* jshint -W056 */
	// $FlowIgnore
	return new (has_buf ? Buffer : Array)(len);
	/* jshint +W056 */
}

var s2a = function s2a(s) {
	if(has_buf) return new Buffer(s, "binary");
	return s.split("").map(function(x){ return x.charCodeAt(0) & 0xff; });
};

var chr0 = /\u0000/g, chr1 = /[\u0001-\u0006]/g;
var __toBuffer = function(bufs) { var x = []; for(var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]); } return x; };
var ___toBuffer = __toBuffer;
var __utf16le = function(b,s,e) { var ss=[]; for(var i=s; i<e; i+=2) ss.push(String.fromCharCode(__readUInt16LE(b,i))); return ss.join("").replace(chr0,''); };
var ___utf16le = __utf16le;
var __hexlify = function(b,s,l) { var ss=[]; for(var i=s; i<s+l; ++i) ss.push(("0" + b[i].toString(16)).slice(-2)); return ss.join(""); };
var ___hexlify = __hexlify;
var __bconcat = function(bufs) {
	if(Array.isArray(bufs[0])) return [].concat.apply([], bufs);
	var maxlen = 0, i = 0;
	for(i = 0; i < bufs.length; ++i) maxlen += bufs[i].length;
	var o = new Uint8Array(maxlen);
	for(i = 0, maxlen = 0; i < bufs.length; maxlen += bufs[i].length, ++i) o.set(bufs[i], maxlen);
	return o;
};
var bconcat = __bconcat;


if(has_buf) {
	__utf16le = function(b,s,e) {
		if(!Buffer.isBuffer(b)) return ___utf16le(b,s,e);
		return b.toString('utf16le',s,e).replace(chr0,'')/*.replace(chr1,'!')*/;
	};
	__hexlify = function(b,s,l) { return Buffer.isBuffer(b) ? b.toString('hex',s,s+l) : ___hexlify(b,s,l); };
	__toBuffer = function(bufs) { return (bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0])) ? Buffer.concat((bufs[0])) : ___toBuffer(bufs);};
	s2a = function(s) { return new Buffer(s, "binary"); };
	bconcat = function(bufs) { return Buffer.isBuffer(bufs[0]) ? Buffer.concat(bufs) : __bconcat(bufs); };
}


var __readUInt8 = function(b, idx) { return b[idx]; };
var __readUInt16LE = function(b, idx) { return b[idx+1]*(1<<8)+b[idx]; };
var __readInt16LE = function(b, idx) { var u = b[idx+1]*(1<<8)+b[idx]; return (u < 0x8000) ? u : (0xffff - u + 1) * -1; };
var __readUInt32LE = function(b, idx) { return b[idx+3]*(1<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };
var __readInt32LE = function(b, idx) { return (b[idx+3]<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };

function ReadShift(size, t) {
	var oI, oS, type = 0;
	switch(size) {
		case 1: oI = __readUInt8(this, this.l); break;
		case 2: oI = (t !== 'i' ? __readUInt16LE : __readInt16LE)(this, this.l); break;
		case 4: oI = __readInt32LE(this, this.l); break;
		case 16: type = 2; oS = __hexlify(this, this.l, size);
	}
	this.l += size; if(type === 0) return oI; return oS;
}

var __writeUInt32LE = function(b, val, idx) { b[idx] = (val & 0xFF); b[idx+1] = ((val >>> 8) & 0xFF); b[idx+2] = ((val >>> 16) & 0xFF); b[idx+3] = ((val >>> 24) & 0xFF); };
var __writeInt32LE  = function(b, val, idx) { b[idx] = (val & 0xFF); b[idx+1] = ((val >> 8) & 0xFF); b[idx+2] = ((val >> 16) & 0xFF); b[idx+3] = ((val >> 24) & 0xFF); };

function WriteShift(t, val, f) {
	var size = 0, i = 0;
	switch(f) {
		case "hex": for(; i < t; ++i) {
this[this.l++] = parseInt(val.slice(2*i, 2*i+2), 16)||0;
		} return this;
		case "utf16le":
var end = this.l + t;
			for(i = 0; i < Math.min(val.length, t); ++i) {
				var cc = val.charCodeAt(i);
				this[this.l++] = cc & 0xff;
				this[this.l++] = cc >> 8;
			}
			while(this.l < end) this[this.l++] = 0;
			return this;
	}
switch(t) {
		case  1: size = 1; this[this.l] = val&0xFF; break;
		case  2: size = 2; this[this.l] = val&0xFF; val >>>= 8; this[this.l+1] = val&0xFF; break;
		case  4: size = 4; __writeUInt32LE(this, val, this.l); break;
		case -4: size = 4; __writeInt32LE(this, val, this.l); break;
	}
	this.l += size; return this;
}

function CheckField(hexstr, fld) {
	var m = __hexlify(this,this.l,hexstr.length>>1);
	if(m !== hexstr) throw new Error(fld + 'Expected ' + hexstr + ' saw ' + m);
	this.l += hexstr.length>>1;
}

function prep_blob(blob, pos) {
	blob.l = pos;
	blob.read_shift = ReadShift;
	blob.chk = CheckField;
	blob.write_shift = WriteShift;
}

function new_buf(sz) {
	var o = (new_raw_buf(sz));
	prep_blob(o, 0);
	return o;
}

/* [MS-CFB] v20171201 */
var CFB = (function _CFB(){
var exports = {};
exports.version = '1.0.5';
/* [MS-CFB] 2.6.4 */
function namecmp(l, r) {
	var L = l.split("/"), R = r.split("/");
	for(var i = 0, c = 0, Z = Math.min(L.length, R.length); i < Z; ++i) {
		if((c = L[i].length - R[i].length)) return c;
		if(L[i] != R[i]) return L[i] < R[i] ? -1 : 1;
	}
	return L.length - R.length;
}
function dirname(p) {
	if(p.charAt(p.length - 1) == "/") return (p.slice(0,-1).indexOf("/") === -1) ? p : dirname(p.slice(0, -1));
	var c = p.lastIndexOf("/");
	return (c === -1) ? p : p.slice(0, c+1);
}

function filename(p) {
	if(p.charAt(p.length - 1) == "/") return filename(p.slice(0, -1));
	var c = p.lastIndexOf("/");
	return (c === -1) ? p : p.slice(c+1);
}
var fs;
function get_fs() { return fs || (fs = require('fs')); }
function parse(file, options) {
if(file.length < 512) throw new Error("CFB file size " + file.length + " < 512");
var mver = 3;
var ssz = 512;
var nmfs = 0; // number of mini FAT sectors
var difat_sec_cnt = 0;
var dir_start = 0;
var minifat_start = 0;
var difat_start = 0;

var fat_addrs = []; // locations of FAT sectors

/* [MS-CFB] 2.2 Compound File Header */
var blob = file.slice(0,512);
prep_blob(blob, 0);

/* major version */
var mv = check_get_mver(blob);
mver = mv[0];
switch(mver) {
	case 3: ssz = 512; break; case 4: ssz = 4096; break;
	default: throw new Error("Major Version: Expected 3 or 4 saw " + mver);
}

/* reprocess header */
if(ssz !== 512) { blob = file.slice(0,ssz); prep_blob(blob, 28 /* blob.l */); }
/* Save header for final object */
var header = file.slice(0,ssz);

check_shifts(blob, mver);

// Number of Directory Sectors
var dir_cnt = blob.read_shift(4, 'i');
if(mver === 3 && dir_cnt !== 0) throw new Error('# Directory Sectors: Expected 0 saw ' + dir_cnt);

// Number of FAT Sectors
blob.l += 4;

// First Directory Sector Location
dir_start = blob.read_shift(4, 'i');

// Transaction Signature
blob.l += 4;

// Mini Stream Cutoff Size
blob.chk('00100000', 'Mini Stream Cutoff Size: ');

// First Mini FAT Sector Location
minifat_start = blob.read_shift(4, 'i');

// Number of Mini FAT Sectors
nmfs = blob.read_shift(4, 'i');

// First DIFAT sector location
difat_start = blob.read_shift(4, 'i');

// Number of DIFAT Sectors
difat_sec_cnt = blob.read_shift(4, 'i');

// Grab FAT Sector Locations
for(var q = -1, j = 0; j < 109; ++j) { /* 109 = (512 - blob.l)>>>2; */
	q = blob.read_shift(4, 'i');
	if(q<0) break;
	fat_addrs[j] = q;
}

/** Break the file up into sectors */
var sectors = sectorify(file, ssz);

sleuth_fat(difat_start, difat_sec_cnt, sectors, ssz, fat_addrs);

/** Chains */
var sector_list = make_sector_list(sectors, dir_start, fat_addrs, ssz);

sector_list[dir_start].name = "!Directory";
if(nmfs > 0 && minifat_start !== ENDOFCHAIN) sector_list[minifat_start].name = "!MiniFAT";
sector_list[fat_addrs[0]].name = "!FAT";
sector_list.fat_addrs = fat_addrs;
sector_list.ssz = ssz;

/* [MS-CFB] 2.6.1 Compound File Directory Entry */
var files = {}, Paths = [], FileIndex = [], FullPaths = [];
read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex, minifat_start);

build_full_paths(FileIndex, FullPaths, Paths);
Paths.shift();

var o = {
	FileIndex: FileIndex,
	FullPaths: FullPaths
};

// $FlowIgnore
if(options && options.raw) o.raw = {header: header, sectors: sectors};
return o;
} // parse

/* [MS-CFB] 2.2 Compound File Header -- read up to major version */
function check_get_mver(blob) {
	// header signature 8
	blob.chk(HEADER_SIGNATURE, 'Header Signature: ');

	// clsid 16
	blob.chk(HEADER_CLSID, 'CLSID: ');

	// minor version 2
	var mver = blob.read_shift(2, 'u');

	return [blob.read_shift(2,'u'), mver];
}
function check_shifts(blob, mver) {
	var shift = 0x09;

	// Byte Order
	//blob.chk('feff', 'Byte Order: '); // note: some writers put 0xffff
	blob.l += 2;

	// Sector Shift
	switch((shift = blob.read_shift(2))) {
		case 0x09: if(mver != 3) throw new Error('Sector Shift: Expected 9 saw ' + shift); break;
		case 0x0c: if(mver != 4) throw new Error('Sector Shift: Expected 12 saw ' + shift); break;
		default: throw new Error('Sector Shift: Expected 9 or 12 saw ' + shift);
	}

	// Mini Sector Shift
	blob.chk('0600', 'Mini Sector Shift: ');

	// Reserved
	blob.chk('000000000000', 'Reserved: ');
}

/** Break the file up into sectors */
function sectorify(file, ssz) {
	var nsectors = Math.ceil(file.length/ssz)-1;
	var sectors = [];
	for(var i=1; i < nsectors; ++i) sectors[i-1] = file.slice(i*ssz,(i+1)*ssz);
	sectors[nsectors-1] = file.slice(nsectors*ssz);
	return sectors;
}

/* [MS-CFB] 2.6.4 Red-Black Tree */
function build_full_paths(FI, FP, Paths) {
	var i = 0, L = 0, R = 0, C = 0, j = 0, pl = Paths.length;
	var dad = [], q = [];

	for(; i < pl; ++i) { dad[i]=q[i]=i; FP[i]=Paths[i]; }

	for(; j < q.length; ++j) {
		i = q[j];
		L = FI[i].L; R = FI[i].R; C = FI[i].C;
		if(dad[i] === i) {
			if(L !== -1 /*NOSTREAM*/ && dad[L] !== L) dad[i] = dad[L];
			if(R !== -1 && dad[R] !== R) dad[i] = dad[R];
		}
		if(C !== -1 /*NOSTREAM*/) dad[C] = i;
		if(L !== -1) { dad[L] = dad[i]; q.push(L); }
		if(R !== -1) { dad[R] = dad[i]; q.push(R); }
	}
	for(i=1; i < pl; ++i) if(dad[i] === i) {
		if(R !== -1 /*NOSTREAM*/ && dad[R] !== R) dad[i] = dad[R];
		else if(L !== -1 && dad[L] !== L) dad[i] = dad[L];
	}

	for(i=1; i < pl; ++i) {
		if(FI[i].type === 0 /* unknown */) continue;
		j = dad[i];
		if(j === 0) FP[i] = FP[0] + "/" + FP[i];
		else while(j !== 0 && j !== dad[j]) {
			FP[i] = FP[j] + "/" + FP[i];
			j = dad[j];
		}
		dad[i] = 0;
	}

	FP[0] += "/";
	for(i=1; i < pl; ++i) {
		if(FI[i].type !== 2 /* stream */) FP[i] += "/";
	}
}

function get_mfat_entry(entry, payload, mini) {
	var start = entry.start, size = entry.size;
	//return (payload.slice(start*MSSZ, start*MSSZ + size));
	var o = [];
	var idx = start;
	while(mini && size > 0 && idx >= 0) {
		o.push(payload.slice(idx * MSSZ, idx * MSSZ + MSSZ));
		size -= MSSZ;
		idx = __readInt32LE(mini, idx * 4);
	}
	if(o.length === 0) return (new_buf(0));
	return (bconcat(o).slice(0, entry.size));
}

/** Chase down the rest of the DIFAT chain to build a comprehensive list
    DIFAT chains by storing the next sector number as the last 32 bits */
function sleuth_fat(idx, cnt, sectors, ssz, fat_addrs) {
	var q = ENDOFCHAIN;
	if(idx === ENDOFCHAIN) {
		if(cnt !== 0) throw new Error("DIFAT chain shorter than expected");
	} else if(idx !== -1 /*FREESECT*/) {
		var sector = sectors[idx], m = (ssz>>>2)-1;
		if(!sector) return;
		for(var i = 0; i < m; ++i) {
			if((q = __readInt32LE(sector,i*4)) === ENDOFCHAIN) break;
			fat_addrs.push(q);
		}
		sleuth_fat(__readInt32LE(sector,ssz-4),cnt - 1, sectors, ssz, fat_addrs);
	}
}

/** Follow the linked list of sectors for a given starting point */
function get_sector_list(sectors, start, fat_addrs, ssz, chkd) {
	var buf = [], buf_chain = [];
	if(!chkd) chkd = [];
	var modulus = ssz - 1, j = 0, jj = 0;
	for(j=start; j>=0;) {
		chkd[j] = true;
		buf[buf.length] = j;
		buf_chain.push(sectors[j]);
		var addr = fat_addrs[Math.floor(j*4/ssz)];
		jj = ((j*4) & modulus);
		if(ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 "+ssz);
		if(!sectors[addr]) break;
		j = __readInt32LE(sectors[addr], jj);
	}
	return {nodes: buf, data:__toBuffer([buf_chain])};
}

/** Chase down the sector linked lists */
function make_sector_list(sectors, dir_start, fat_addrs, ssz) {
	var sl = sectors.length, sector_list = ([]);
	var chkd = [], buf = [], buf_chain = [];
	var modulus = ssz - 1, i=0, j=0, k=0, jj=0;
	for(i=0; i < sl; ++i) {
		buf = ([]);
		k = (i + dir_start); if(k >= sl) k-=sl;
		if(chkd[k]) continue;
		buf_chain = [];
		for(j=k; j>=0;) {
			chkd[j] = true;
			buf[buf.length] = j;
			buf_chain.push(sectors[j]);
			var addr = fat_addrs[Math.floor(j*4/ssz)];
			jj = ((j*4) & modulus);
			if(ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 "+ssz);
			if(!sectors[addr]) break;
			j = __readInt32LE(sectors[addr], jj);
		}
		sector_list[k] = ({nodes: buf, data:__toBuffer([buf_chain])});
	}
	return sector_list;
}

/* [MS-CFB] 2.6.1 Compound File Directory Entry */
function read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex, mini) {
	var minifat_store = 0, pl = (Paths.length?2:0);
	var sector = sector_list[dir_start].data;
	var i = 0, namelen = 0, name;
	for(; i < sector.length; i+= 128) {
		var blob = sector.slice(i, i+128);
		prep_blob(blob, 64);
		namelen = blob.read_shift(2);
		name = __utf16le(blob,0,namelen-pl);
		Paths.push(name);
		var o = ({
			name:  name,
			type:  blob.read_shift(1),
			color: blob.read_shift(1),
			L:     blob.read_shift(4, 'i'),
			R:     blob.read_shift(4, 'i'),
			C:     blob.read_shift(4, 'i'),
			clsid: blob.read_shift(16),
			state: blob.read_shift(4, 'i'),
			start: 0,
			size: 0
		});
		var ctime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(ctime !== 0) o.ct = read_date(blob, blob.l-8);
		var mtime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(mtime !== 0) o.mt = read_date(blob, blob.l-8);
		o.start = blob.read_shift(4, 'i');
		o.size = blob.read_shift(4, 'i');
		if(o.size < 0 && o.start < 0) { o.size = o.type = 0; o.start = ENDOFCHAIN; o.name = ""; }
		if(o.type === 5) { /* root */
			minifat_store = o.start;
			if(nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData";
			/*minifat_size = o.size;*/
		} else if(o.size >= 4096 /* MSCSZ */) {
			o.storage = 'fat';
			if(sector_list[o.start] === undefined) sector_list[o.start] = get_sector_list(sectors, o.start, sector_list.fat_addrs, sector_list.ssz);
			sector_list[o.start].name = o.name;
			o.content = (sector_list[o.start].data.slice(0,o.size));
		} else {
			o.storage = 'minifat';
			if(o.size < 0) o.size = 0;
			else if(minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN && sector_list[minifat_store]) {
				o.content = get_mfat_entry(o, sector_list[minifat_store].data, (sector_list[mini]||{}).data);
			}
		}
		if(o.content) prep_blob(o.content, 0);
		files[name] = o;
		FileIndex.push(o);
	}
}

function read_date(blob, offset) {
	return new Date(( ( (__readUInt32LE(blob,offset+4)/1e7)*Math.pow(2,32)+__readUInt32LE(blob,offset)/1e7 ) - 11644473600)*1000);
}

function read_file(filename, options) {
	get_fs();
	return parse(fs.readFileSync(filename), options);
}

function read(blob, options) {
	switch(options && options.type || "base64") {
		case "file": return read_file(blob, options);
		case "base64": return parse(s2a(Base64.decode(blob)), options);
		case "binary": return parse(s2a(blob), options);
	}
	return parse(blob, options);
}

function init_cfb(cfb, opts) {
	var o = opts || {}, root = o.root || "Root Entry";
	if(!cfb.FullPaths) cfb.FullPaths = [];
	if(!cfb.FileIndex) cfb.FileIndex = [];
	if(cfb.FullPaths.length !== cfb.FileIndex.length) throw new Error("inconsistent CFB structure");
	if(cfb.FullPaths.length === 0) {
		cfb.FullPaths[0] = root + "/";
		cfb.FileIndex[0] = ({ name: root, type: 5 });
	}
	if(o.CLSID) cfb.FileIndex[0].clsid = o.CLSID;
	seed_cfb(cfb);
}
function seed_cfb(cfb) {
	var nm = "\u0001Sh33tJ5";
	if(CFB.find(cfb, "/" + nm)) return;
	var p = new_buf(4); p[0] = 55; p[1] = p[3] = 50; p[2] = 54;
	cfb.FileIndex.push(({ name: nm, type: 2, content:p, size:4, L:69, R:69, C:69 }));
	cfb.FullPaths.push(cfb.FullPaths[0] + nm);
	rebuild_cfb(cfb);
}
function rebuild_cfb(cfb, f) {
	init_cfb(cfb);
	var gc = false, s = false;
	for(var i = cfb.FullPaths.length - 1; i >= 0; --i) {
		var _file = cfb.FileIndex[i];
		switch(_file.type) {
			case 0:
				if(s) gc = true;
				else { cfb.FileIndex.pop(); cfb.FullPaths.pop(); }
				break;
			case 1: case 2: case 5:
				s = true;
				if(isNaN(_file.R * _file.L * _file.C)) gc = true;
				if(_file.R > -1 && _file.L > -1 && _file.R == _file.L) gc = true;
				break;
			default: gc = true; break;
		}
	}
	if(!gc && !f) return;

	var now = new Date(1987, 1, 19), j = 0;
	var data = [];
	for(i = 0; i < cfb.FullPaths.length; ++i) {
		if(cfb.FileIndex[i].type === 0) continue;
		data.push([cfb.FullPaths[i], cfb.FileIndex[i]]);
	}
	for(i = 0; i < data.length; ++i) {
		var dad = dirname(data[i][0]);
		s = false;
		for(j = 0; j < data.length; ++j) if(data[j][0] === dad) s = true;
		if(!s) data.push([dad, ({
			name: filename(dad).replace("/",""),
			type: 1,
			clsid: HEADER_CLSID,
			ct: now, mt: now,
			content: null
		})]);
	}

	data.sort(function(x,y) { return namecmp(x[0], y[0]); });
	cfb.FullPaths = []; cfb.FileIndex = [];
	for(i = 0; i < data.length; ++i) { cfb.FullPaths[i] = data[i][0]; cfb.FileIndex[i] = data[i][1]; }
	for(i = 0; i < data.length; ++i) {
		var elt = cfb.FileIndex[i];
		var nm = cfb.FullPaths[i];

		elt.name =  filename(nm).replace("/","");
		elt.L = elt.R = elt.C = -(elt.color = 1);
		elt.size = elt.content ? elt.content.length : 0;
		elt.start = 0;
		elt.clsid = (elt.clsid || HEADER_CLSID);
		if(i === 0) {
			elt.C = data.length > 1 ? 1 : -1;
			elt.size = 0;
			elt.type = 5;
		} else if(nm.slice(-1) == "/") {
			for(j=i+1;j < data.length; ++j) if(dirname(cfb.FullPaths[j])==nm) break;
			elt.C = j >= data.length ? -1 : j;
			for(j=i+1;j < data.length; ++j) if(dirname(cfb.FullPaths[j])==dirname(nm)) break;
			elt.R = j >= data.length ? -1 : j;
			elt.type = 1;
		} else {
			if(dirname(cfb.FullPaths[i+1]||"") == dirname(nm)) elt.R = i + 1;
			elt.type = 2;
		}
	}

}

function _write(cfb, options) {
	var _opts = options || {};
	rebuild_cfb(cfb);
	var L = (function(cfb){
		var mini_size = 0, fat_size = 0;
		for(var i = 0; i < cfb.FileIndex.length; ++i) {
			var file = cfb.FileIndex[i];
			if(!file.content) continue;
var flen = file.content.length;
			if(flen > 0){
				if(flen < 0x1000) mini_size += (flen + 0x3F) >> 6;
				else fat_size += (flen + 0x01FF) >> 9;
			}
		}
		var dir_cnt = (cfb.FullPaths.length +3) >> 2;
		var mini_cnt = (mini_size + 7) >> 3;
		var mfat_cnt = (mini_size + 0x7F) >> 7;
		var fat_base = mini_cnt + fat_size + dir_cnt + mfat_cnt;
		var fat_cnt = (fat_base + 0x7F) >> 7;
		var difat_cnt = fat_cnt <= 109 ? 0 : Math.ceil((fat_cnt-109)/0x7F);
		while(((fat_base + fat_cnt + difat_cnt + 0x7F) >> 7) > fat_cnt) difat_cnt = ++fat_cnt <= 109 ? 0 : Math.ceil((fat_cnt-109)/0x7F);
		var L =  [1, difat_cnt, fat_cnt, mfat_cnt, dir_cnt, fat_size, mini_size, 0];
		cfb.FileIndex[0].size = mini_size << 6;
		L[7] = (cfb.FileIndex[0].start=L[0]+L[1]+L[2]+L[3]+L[4]+L[5])+((L[6]+7) >> 3);
		return L;
	})(cfb);
	var o = new_buf(L[7] << 9);
	var i = 0, T = 0;
	{
		for(i = 0; i < 8; ++i) o.write_shift(1, HEADER_SIG[i]);
		for(i = 0; i < 8; ++i) o.write_shift(2, 0);
		o.write_shift(2, 0x003E);
		o.write_shift(2, 0x0003);
		o.write_shift(2, 0xFFFE);
		o.write_shift(2, 0x0009);
		o.write_shift(2, 0x0006);
		for(i = 0; i < 3; ++i) o.write_shift(2, 0);
		o.write_shift(4, 0);
		o.write_shift(4, L[2]);
		o.write_shift(4, L[0] + L[1] + L[2] + L[3] - 1);
		o.write_shift(4, 0);
		o.write_shift(4, 1<<12);
		o.write_shift(4, L[3] ? L[0] + L[1] + L[2] - 1: ENDOFCHAIN);
		o.write_shift(4, L[3]);
		o.write_shift(-4, L[1] ? L[0] - 1: ENDOFCHAIN);
		o.write_shift(4, L[1]);
		for(i = 0; i < 109; ++i) o.write_shift(-4, i < L[2] ? L[1] + i : -1);
	}
	if(L[1]) {
		for(T = 0; T < L[1]; ++T) {
			for(; i < 236 + T * 127; ++i) o.write_shift(-4, i < L[2] ? L[1] + i : -1);
			o.write_shift(-4, T === L[1] - 1 ? ENDOFCHAIN : T + 1);
		}
	}
	var chainit = function(w) {
		for(T += w; i<T-1; ++i) o.write_shift(-4, i+1);
		if(w) { ++i; o.write_shift(-4, ENDOFCHAIN); }
	};
	T = i = 0;
	for(T+=L[1]; i<T; ++i) o.write_shift(-4, consts.DIFSECT);
	for(T+=L[2]; i<T; ++i) o.write_shift(-4, consts.FATSECT);
	chainit(L[3]);
	chainit(L[4]);
	var j = 0, flen = 0;
	var file = cfb.FileIndex[0];
	for(; j < cfb.FileIndex.length; ++j) {
		file = cfb.FileIndex[j];
		if(!file.content) continue;
flen = file.content.length;
		if(flen < 0x1000) continue;
		file.start = T;
		chainit((flen + 0x01FF) >> 9);
	}
	chainit((L[6] + 7) >> 3);
	while(o.l & 0x1FF) o.write_shift(-4, consts.ENDOFCHAIN);
	T = i = 0;
	for(j = 0; j < cfb.FileIndex.length; ++j) {
		file = cfb.FileIndex[j];
		if(!file.content) continue;
flen = file.content.length;
		if(!flen || flen >= 0x1000) continue;
		file.start = T;
		chainit((flen + 0x3F) >> 6);
	}
	while(o.l & 0x1FF) o.write_shift(-4, consts.ENDOFCHAIN);
	for(i = 0; i < L[4]<<2; ++i) {
		var nm = cfb.FullPaths[i];
		if(!nm || nm.length === 0) {
			for(j = 0; j < 17; ++j) o.write_shift(4, 0);
			for(j = 0; j < 3; ++j) o.write_shift(4, -1);
			for(j = 0; j < 12; ++j) o.write_shift(4, 0);
			continue;
		}
		file = cfb.FileIndex[i];
		if(i === 0) file.start = file.size ? file.start - 1 : ENDOFCHAIN;
		var _nm = (i === 0 && _opts.root) || file.name;
		flen = 2*(_nm.length+1);
		o.write_shift(64, _nm, "utf16le");
		o.write_shift(2, flen);
		o.write_shift(1, file.type);
		o.write_shift(1, file.color);
		o.write_shift(-4, file.L);
		o.write_shift(-4, file.R);
		o.write_shift(-4, file.C);
		if(!file.clsid) for(j = 0; j < 4; ++j) o.write_shift(4, 0);
		else o.write_shift(16, file.clsid, "hex");
		o.write_shift(4, file.state || 0);
		o.write_shift(4, 0); o.write_shift(4, 0);
		o.write_shift(4, 0); o.write_shift(4, 0);
		o.write_shift(4, file.start);
		o.write_shift(4, file.size); o.write_shift(4, 0);
	}
	for(i = 1; i < cfb.FileIndex.length; ++i) {
		file = cfb.FileIndex[i];
if(file.size >= 0x1000) {
			o.l = (file.start+1) << 9;
			for(j = 0; j < file.size; ++j) o.write_shift(1, file.content[j]);
			for(; j & 0x1FF; ++j) o.write_shift(1, 0);
		}
	}
	for(i = 1; i < cfb.FileIndex.length; ++i) {
		file = cfb.FileIndex[i];
if(file.size > 0 && file.size < 0x1000) {
			for(j = 0; j < file.size; ++j) o.write_shift(1, file.content[j]);
			for(; j & 0x3F; ++j) o.write_shift(1, 0);
		}
	}
	while(o.l < o.length) o.write_shift(1, 0);
	return o;
}
/* [MS-CFB] 2.6.4 (Unicode 3.0.1 case conversion) */
function find(cfb, path) {
	var UCFullPaths = cfb.FullPaths.map(function(x) { return x.toUpperCase(); });
	var UCPaths = UCFullPaths.map(function(x) { var y = x.split("/"); return y[y.length - (x.slice(-1) == "/" ? 2 : 1)]; });
	var k = false;
	if(path.charCodeAt(0) === 47 /* "/" */) { k = true; path = UCFullPaths[0].slice(0, -1) + path; }
	else k = path.indexOf("/") !== -1;
	var UCPath = path.toUpperCase();
	var w = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
	if(w !== -1) return cfb.FileIndex[w];

	var m = !UCPath.match(chr1);
	UCPath = UCPath.replace(chr0,'');
	if(m) UCPath = UCPath.replace(chr1,'!');
	for(w = 0; w < UCFullPaths.length; ++w) {
		if((m ? UCFullPaths[w].replace(chr1,'!') : UCFullPaths[w]).replace(chr0,'') == UCPath) return cfb.FileIndex[w];
		if((m ? UCPaths[w].replace(chr1,'!') : UCPaths[w]).replace(chr0,'') == UCPath) return cfb.FileIndex[w];
	}
	return null;
}
/** CFB Constants */
var MSSZ = 64; /* Mini Sector Size = 1<<6 */
//var MSCSZ = 4096; /* Mini Stream Cutoff Size */
/* 2.1 Compound File Sector Numbers and Types */
var ENDOFCHAIN = -2;
/* 2.2 Compound File Header */
var HEADER_SIGNATURE = 'd0cf11e0a1b11ae1';
var HEADER_SIG = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
var HEADER_CLSID = '00000000000000000000000000000000';
var consts = {
	/* 2.1 Compund File Sector Numbers and Types */
	MAXREGSECT: -6,
	DIFSECT: -4,
	FATSECT: -3,
	ENDOFCHAIN: ENDOFCHAIN,
	FREESECT: -1,
	/* 2.2 Compound File Header */
	HEADER_SIGNATURE: HEADER_SIGNATURE,
	HEADER_MINOR_VERSION: '3e00',
	MAXREGSID: -6,
	NOSTREAM: -1,
	HEADER_CLSID: HEADER_CLSID,
	/* 2.6.1 Compound File Directory Entry */
	EntryTypes: ['unknown','storage','stream','lockbytes','property','root']
};

function write_file(cfb, filename, options) {
	get_fs();
	var o = _write(cfb, options);
fs.writeFileSync(filename, o);
}

function a2s(o) {
	var out = new Array(o.length);
	for(var i = 0; i < o.length; ++i) out[i] = String.fromCharCode(o[i]);
	return out.join("");
}

function write(cfb, options) {
	var o = _write(cfb, options);
	switch(options && options.type) {
		case "file": get_fs(); fs.writeFileSync(options.filename, (o)); return o;
		case "binary": return a2s(o);
		case "base64": return Base64.encode(a2s(o));
	}
	return o;
}
function cfb_new(opts) {
	var o = ({});
	init_cfb(o, opts);
	return o;
}

function cfb_add(cfb, name, content, opts) {
	init_cfb(cfb);
	var file = CFB.find(cfb, name);
	if(!file) {
		var fpath = cfb.FullPaths[0];
		if(name.slice(0, fpath.length) == fpath) fpath = name;
		else {
			if(fpath.slice(-1) != "/") fpath += "/";
			fpath = (fpath + name).replace("//","/");
		}
		file = ({name: filename(name), type: 2});
		cfb.FileIndex.push(file);
		cfb.FullPaths.push(fpath);
		CFB.utils.cfb_gc(cfb);
	}
file.content = (content);
	file.size = content ? content.length : 0;
	if(opts) {
		if(opts.CLSID) file.clsid = opts.CLSID;
	}
	return file;
}

function cfb_del(cfb, name) {
	init_cfb(cfb);
	var file = CFB.find(cfb, name);
	if(file) for(var j = 0; j < cfb.FileIndex.length; ++j) if(cfb.FileIndex[j] == file) {
		cfb.FileIndex.splice(j, 1);
		cfb.FullPaths.splice(j, 1);
		return true;
	}
	return false;
}

function cfb_mov(cfb, old_name, new_name) {
	init_cfb(cfb);
	var file = CFB.find(cfb, old_name);
	if(file) for(var j = 0; j < cfb.FileIndex.length; ++j) if(cfb.FileIndex[j] == file) {
		cfb.FileIndex[j].name = filename(new_name);
		cfb.FullPaths[j] = new_name;
		return true;
	}
	return false;
}

function cfb_gc(cfb) { rebuild_cfb(cfb, true); }

exports.find = find;
exports.read = read;
exports.parse = parse;
exports.write = write;
exports.writeFile = write_file;
exports.utils = {
	cfb_new: cfb_new,
	cfb_add: cfb_add,
	cfb_del: cfb_del,
	cfb_mov: cfb_mov,
	cfb_gc: cfb_gc,
	ReadShift: ReadShift,
	CheckField: CheckField,
	prep_blob: prep_blob,
	bconcat: bconcat,
	consts: consts
};

return exports;
})();

if(typeof require !== 'undefined' && typeof module !== 'undefined' && typeof DO_NOT_EXPORT_CFB === 'undefined') { module.exports = CFB; }
