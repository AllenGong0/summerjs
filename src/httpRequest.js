const http = require('http');
const URL = require('url').URL;
const net = require('net');
const accepts = require('accepts');
const contentType = require('content-type');
const stringify = require('url').format;
const parse = require('parseurl');
const qs = require('querystring');
const typeis = require('type-is');
const fresh = require('fresh');
const only = require('only');
const util = require('util');
/**
 *   class IncomingMessage extends stream.Readable {
        constructor(socket: Socket);
        httpVersion: string;
        httpVersionMajor: number;
        httpVersionMinor: number;
        complete: boolean;
        connection: Socket;
        headers: IncomingHttpHeaders;
        rawHeaders: string[];
        trailers: { [key: string]: string | undefined };
        rawTrailers: string[];
        setTimeout(msecs: number, callback: () => void): this;
        method?: string;
        url?: string;
        statusCode?: number;
        statusMessage?: string;
        socket: Socket;
        destroy(error?: Error): void;
    }

 */

class httpRequest extends http.IncomingMessage {


    /**
     * Return request header.
     *
     * @return {Object}
     * @api public
     */

    header() {
        return this.headers;
    }

    /**
     * Set request header.
     *
     * @api public
     */

    header(val) {
        this.headers = val;
    }

    /**
     * Return request header, alias as request.header
     *
     * @return {Object}
     * @api public
     */

    headers() {
        return this.headers;
    }

    /**
     * Set request header, alias as request.header
     *
     * @api public
     */

    headers(val) {
        this.headers = val;
    }

    /**
     * Get request URL.
     *
     * @return {String}
     * @api public
     */

    url() {
        return this.url;
    }

    /**
     *  request URL.
     *
     * @api public
     */

    url(val) {
        this.url = val;
    }

    /**
     * Get origin of URL.
     *
     * @return {String}
     * @api public
     */

    origin() {
        return `${this.protocol()}://${this.host()}`;
    }

    /**
     * Get full request URL.
     *
     * @return {String}
     * @api public
     */

    href() {
        // support: `GET http://example.com/foo`
        if (/^https?:\/\//i.test(this.originalUrl)) return this.originalUrl;
        return this.origin + this.originalUrl;
    }

    /**
     * Get request method.
     *
     * @return {String}
     * @api public
     */

    method() {
        return this.method;
    }

    /**
     *  request method.
     *
     * @param {String} val
     * @api public
     */

    method(val) {
        this.method = val;
    }

    /**
     * Get request pathname.
     *
     * @return {String}
     * @api public
     */

    path() {
        return parse(this).pathname;
    }

    /**
     *  pathname, retaining the query-string when present.
     *
     * @param {String} path
     * @api public
     */

    path(path) {
        const url = this.URL;
        if (url.pathname === path) return;

        url.pathname = path;
        url.path = null;

        this.url = stringify(url);
    }

    /**
     * Get parsed query-string.
     *
     * @return {Object}
     * @api public
     */

    query() {
        const str = this.querystring;
        const c = this._querycache = this._querycache || {};
        return c[str] || (c[str] = qs.parse(str));
    }

    /**
     *  query-string as an object.
     *
     * @param {Object} obj
     * @api public
     */

    query(obj) {
        this.querystring = qs.stringify(obj);
    }

    /**
     * Get query string.
     *
     * @return {String}
     * @api public
     */

    querystring() {
        if (!this) return '';
        return this.url().query || '';
    }

    /**
     *  querystring.
     *
     * @param {String} str
     * @api public
     */

    querystring(str) {
        const url = this.url();
        if (url.search === `?${str}`) return;

        url.search = str;
        url.path = null;

        this.url = stringify(url);
    }

    /**
     * Get the search string. Same as the querystring
     * except it includes the leading ?.
     *
     * @return {String}
     * @api public
     */

    search() {
        if (!this.querystring) return '';
        return `?${this.querystring}`;
    }

    /**
     *  the search string. Same as
     * request.querystring= but included for ubiquity.
     *
     * @param {String} str
     * @api public
     */

    search(str) {
        this.querystring = str;
    }

    /**
     * Parse the "Host" header field host
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String} hostname:port
     * @api public
     */
    //TODO 需要修改
    host() {
        let host = this.headers().host;
        if (!host) {
            if (this.httpVersionMajor >= 2) host = this.get(':authority');
            if (!host) host = this.get('Host');
        }
        if (!host) return '';
        return host.split(/\s*,\s*/, 1)[0];
    }

    /**
     * Parse the "Host" header field hostname
     * and support X-Forwarded-Host when a
     * proxy is enabled.
     *
     * @return {String} hostname
     * @api public
     */

    hostname() {
        const host = this.host;
        if (!host) return '';
        if ('[' == host[0]) return this.URL.hostname || ''; // IPv6
        return host.split(':', 1)[0];
    }

    /**
     * Get WHATWG parsed URL.
     * Lazily memoized.
     *
     * @return {URL|Object}
     * @api public
     */

    URL() {
        /* istanbul ignore else */
        if (!this.memoizedURL) {
            const originalUrl = this.originalUrl || ''; // avoid undefined in template string
            try {
                this.memoizedURL = new URL(`${this.origin}${originalUrl}`);
            } catch (err) {
                this.memoizedURL = Object.create(null);
            }
        }
        return this.memoizedURL;
    }

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     *
     * @return {Boolean}
     * @api public
     */
    //TODO 需要修改
    fresh() {
        const method = this.method;
        const s = this.ctx.status;

        // GET or HEAD for weak freshness validation only
        if ('GET' != method && 'HEAD' != method) return false;

        // 2xx or 304 as per rfc2616 14.26
        if ((s >= 200 && s < 300) || 304 == s) {
            return fresh(this.header, this.response.header);
        }

        return false;
    }

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     *
     * @return {Boolean}
     * @api public
     */

    stale() {
        return !this.fresh;
    }

    /**
     * Check if the request is idempotent.
     *
     * @return {Boolean}
     * @api public
     */

    idempotent() {
        const methods = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
        return !!~methods.indexOf(this.method);
    }

    /**
     * Return the request socket.
     *
     * @return {Connection}
     * @api public
     */

    socket() {
        return this.req.socket;
    }

    /**
     * Get the charset when present or undefined.
     *
     * @return {String}
     * @api public
     */

    charset() {
        try {
            const { parameters } = contentType.parse(this.req);
            return parameters.charset || '';
        } catch (e) {
            return '';
        }
    }

    /**
     * Return parsed Content-Length when present.
     *
     * @return {Number}
     * @api public
     */

    length() {
        const len = this.get('Content-Length');
        if (len == '') return;
        return ~~len;
    }

    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the proxy setting
     * is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     *
     * @return {String}
     * @api public
     */
    //TODO 这里需要处理一下
    protocol() {
        if (this.socket.encrypted) return 'https';
        if (!this.app.proxy) return 'http';
        const proto = this.get('X-Forwarded-Proto');
        return proto ? proto.split(/\s*,\s*/, 1)[0] : 'http';
    }

    /**
     * Short-hand for:
     *
     *    this.protocol == 'https'
     *
     * @return {Boolean}
     * @api public
     */
    //TODO:这里需要处理一下
    secure() {
        return 'https' == this.protocol;
    }

    /**
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value were "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     *
     * @return {Array}
     * @api public
     */

    ips() {
        const proxy = this.app.proxy;
        const val = this.get('X-Forwarded-For');
        return proxy && val
            ? val.split(/\s*,\s*/)
            : [];
    }

    /**
     * Return request's remote address
     * When `app.proxy` is `true`, parse
     * the "X-Forwarded-For" ip address list and return the first one
     *
     * @return {String}
     * @api public
     */

    ip() {
        if (!this[IP]) {
            this[IP] = this.ips[0] || this.socket.remoteAddress || '';
        }
        return this[IP];
    }

    ip(_ip) {
        this[IP] = _ip;
    }

    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain
     * of the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting `app.subdomainOffset`.
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If `app.subdomainOffset` is not set, this.subdomains is
     * `["ferrets", "tobi"]`.
     * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
     *
     * @return {Array}
     * @api public
     */

    subdomains() {
        const offset = this.app.subdomainOffset;
        const hostname = this.hostname;
        if (net.isIP(hostname)) return [];
        return hostname
            .split('.')
            .reverse()
            .slice(offset);
    }

    /**
     * Get accept object.
     * Lazily memoized.
     *
     * @return {Object}
     * @api private
     */
    accept() {
        return this._accept || (this._accept = accepts(this));
    }

    /**
     * Set accept object.
     *
     * @param {Object}
     * @api private
     */
    accept(obj) {
        this._accept = obj;
    }

    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `false`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json" or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     this.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('html');
     *     // => "html"
     *     this.accepts('text/html');
     *     // => "text/html"
     *     this.accepts('json', 'text');
     *     // => "json"
     *     this.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts('image/png');
     *     this.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts(['html', 'json']);
     *     this.accepts('html', 'json');
     *     // => "json"
     *
     * @param {String|Array} type(s)...
     * @return {String|Array|false}
     * @api public
     */

    accepts(...args) {
        return this.accept.types(...args);
    }

    /**
     * Return accepted encodings or best fit based on `encodings`.
     *
     * Given `Accept-Encoding: gzip, deflate`
     * an array sorted by quality is returned:
     *
     *     ['gzip', 'deflate']
     *
     * @param {String|Array} encoding(s)...
     * @return {String|Array}
     * @api public
     */

    acceptsEncodings(...args) {
        return this.accept.encodings(...args);
    }

    /**
     * Return accepted charsets or best fit based on `charsets`.
     *
     * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
     * an array sorted by quality is returned:
     *
     *     ['utf-8', 'utf-7', 'iso-8859-1']
     *
     * @param {String|Array} charset(s)...
     * @return {String|Array}
     * @api public
     */

    acceptsCharsets(...args) {
        return this.accept.charsets(...args);
    }

    /**
     * Return accepted languages or best fit based on `langs`.
     *
     * Given `Accept-Language: en;q=0.8, es, pt`
     * an array sorted by quality is returned:
     *
     *     ['es', 'pt', 'en']
     *
     * @param {String|Array} lang(s)...
     * @return {Array|String}
     * @api public
     */

    acceptsLanguages(...args) {
        return this.accept.languages(...args);
    }

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field, and it contains any of the give mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * Examples:
     *
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is('html'); // => 'html'
     *     this.is('text/html'); // => 'text/html'
     *     this.is('text/*', 'application/json'); // => 'text/html'
     *
     *     // When Content-Type is application/json
     *     this.is('json', 'urlencoded'); // => 'json'
     *     this.is('application/json'); // => 'application/json'
     *     this.is('html', 'application/*'); // => 'application/json'
     *
     *     this.is('html'); // => false
     *
     * @param {String|Array} types...
     * @return {String|false|null}
     * @api public
     */

    is(types) {
        if (!types) return typeis(this.req);
        if (!Array.isArray(types)) types = [].slice.call(arguments);
        return typeis(this.req, types);
    }

    /**
     * Return the request mime type void of
     * parameters such as "charset".
     *
     * @return {String}
     * @api public
     */

    type() {
        const type = this.get('Content-Type');
        if (!type) return '';
        return type.split(';')[0];
    }

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     this.get('Content-Type');
     *     // => "text/plain"
     *
     *     this.get('content-type');
     *     // => "text/plain"
     *
     *     this.get('Something');
     *     // => ''
     *
     * @param {String} field
     * @return {String}
     * @api public
     */

    get(field) {
        const req = this.req;
        switch (field = field.toLowerCase()) {
            case 'referer':
            case 'referrer':
                return req.headers.referrer || req.headers.referer || '';
            default:
                return req.headers[field] || '';
        }
    }

    /**
     * Inspect implementation.
     *
     * @return {Object}
     * @api public
     */

    // inspect() {
    //     if (!this.req) return;
    //     return this.toJSON();
    // }

    /**
     * Return JSON representation.
     *
     * @return {Object}
     * @api public
     */

    toJSON() {
        return only(this, [
            'method',
            'url',
            'header'
        ]);
    }
}
/**
   * Custom inspection implementation for newer Node.js versions.
   *
   * @return {Object}
   * @api public
   */
module.exports = httpRequest;

