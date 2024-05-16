/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2000-2022 signotec GmbH
 * signotec GmbH
 * Am Gierath 20b
 * 40885 Ratingen
 * Tel: +49 (2102) 5 35 75-10
 * Fax: +49 (2102) 5 35 75-39
 * E-Mail: info@signotec.de
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export var STPadServerLibCommons = {};
(function (context) {
  var _onOpen = null;
  var _onClose = null;
  var _onError = null;
  var _stPadServer = null;
  var _isActiveX = false;
  var _resultValues = {};

  const supportedInterfaceVersion = "3.3.0.0";

  const Strings = {
    TOKEN_TYPE_REQUEST: "TOKEN_TYPE_REQUEST",
    TOKEN_TYPE_RESPONSE: "TOKEN_TYPE_RESPONSE",
    TOKEN_TYPE_SEND: "TOKEN_TYPE_SEND",
    TOKEN_CMD_GET_SERVER_VERSION: "TOKEN_CMD_GET_SERVER_VERSION",
    TOKEN_CMD_GET_INTERFACE_VERSION: "TOKEN_CMD_GET_INTERFACE_VERSION",
    TOKEN_CMD_SET_INTERFACE_VERSION: "TOKEN_CMD_SET_INTERFACE_VERSION",
    TOKEN_CMD_INCORRECT_COMMAND: "TOKEN_CMD_INCORRECT_COMMAND",
  };

  context.handleLogging = function (message) {};
  context.handleNextSignaturePoint = function (message) {};
  context.handleDisconnect = function (message) {};

  context.Params = {
    getServerVersion: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_GET_SERVER_VERSION;
    },
    getInterfaceVersion: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_GET_INTERFACE_VERSION;
    },
    setInterfaceVersion: function (version) {
      if (version === undefined || version === null) {
        throw "Invalid value for mandatory parameter 'version'";
      }
      if (0 < compareVersion(version)) {
        throw "Target version " + version + " is too new";
      }
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SET_INTERFACE_VERSION;
      this.TOKEN_PARAM_VERSION = version;
    },
  };

  context.getServerVersion = function () {
    context.send(JSON.stringify(new context.Params.getServerVersion()));
    return context.createPromise(Strings.TOKEN_CMD_GET_SERVER_VERSION);
  };

  context.getInterfaceVersion = function () {
    context.send(JSON.stringify(new context.Params.getInterfaceVersion()));
    return context.createPromise(Strings.TOKEN_CMD_GET_INTERFACE_VERSION);
  };

  context.setInterfaceVersion = function (params) {
    context.send(JSON.stringify(params));
    return context.createPromise(Strings.TOKEN_CMD_SET_INTERFACE_VERSION);
  };

  context.createConnection = function (
    url,
    onOpenParam,
    onCloseParam,
    onErrorParam
  ) {
    if (_stPadServer != null) {
      throw "WebSocket object is already created. Please call 'STPadServerLibCommons.destroyConnection()' first!";
    }
    _onOpen = onOpenParam;
    _onClose = onCloseParam;
    _onError = onErrorParam;

    // try {
    //   _isActiveX = true;
    //   _stPadServer = new ActiveXObject("signotec.STPadActiveXServer");
    //   STPadServerLibCommons.handleLogging(
    //     "STPadServerLibCommons.createConnection(): ActiveXObject successfully created"
    //   );
    //   _stPadServer.onmessage = onMessage;
    //   onOpen({ SUCCESS: true });
    // } catch (e) {
    //   STPadServerLibCommons.handleLogging(
    //     "STPadServerLibCommons.createConnection(): ActiveXObject could not be created. Reason: " +
    //       e
    //   );
    _isActiveX = false;
    _stPadServer = new WebSocket(url);
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.createConnection(): WebSocket successfully created"
    );
    _stPadServer.onopen = onOpen;
    _stPadServer.onerror = onErrorParam;
    _stPadServer.onmessage = onMessage;
    //}
  };

  context.destroyConnection = function () {
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.destroyConnection()"
    );
    if (_stPadServer != null && !_isActiveX) {
      _stPadServer.close();
    }
    _stPadServer = null;
  };

  context.getSTPadServer = function () {
    if (_stPadServer == null) {
      throw "STPadServer object is null. Please call 'STPadServerLibCommons.createConnection()' first!";
    }
    return _stPadServer;
  };

  context.send = function (message) {
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.send(): message = " + message
    );
    context.getSTPadServer().send(message);
  };

  function onOpen(event) {
    STPadServerLibCommons.handleLogging("onOpen()");
    context
      .getServerVersion()
      .then(function (version) {
        if (compareVersion(version.serverVersion) <= 0) {
          var params = new context.Params.setInterfaceVersion(
            supportedInterfaceVersion
          );
          context.setInterfaceVersion(params).then(function (value) {
            _onOpen(event);
            if (!_isActiveX) {
              _stPadServer.onopen = _onOpen;
              _stPadServer.onclose = _onClose;
            }
          }, context.defaultReject);
        } else {
          _onOpen(event);
          if (!_isActiveX) {
            _stPadServer.onopen = _onOpen;
            _stPadServer.onclose = _onClose;
          }
        }
      }, context.defaultReject)
      .then(null, function (reason) {
        if (!_isActiveX) {
          _stPadServer.onopen = null;
          _stPadServer.onclose = null;
          _stPadServer.onerror = null;
        }
        _stPadServer.onmessage = null;
        context.destroyConnection();
        var error = new Event("error");
        error.details =
          "Function " +
          reason.command +
          " failed. Reason: " +
          reason.errorMessage;
        _onError(error);
      });
  }

  function onMessage(event) {
    STPadServerLibCommons.handleLogging(
      "onMessage(): event.data = " + event.data
    );
    var message = JSON.parse(event.data);

    switch (message.TOKEN_TYPE) {
      case Strings.TOKEN_TYPE_REQUEST:
        break;
      case Strings.TOKEN_TYPE_RESPONSE:
        handleResponse(message);
        break;
      case Strings.TOKEN_TYPE_SEND:
        handleSendEvent(message);
        break;
      default:
        STPadServerLibCommons.handleLogging(
          "onMessage(): Invalid token type: " + message.TOKEN_TYPE
        );
    }
  }

  function handleResponse(message) {
    var resultObject = { command: message.TOKEN_CMD_ORIGIN };
    var intReturnCode = parseInt(message.TOKEN_PARAM_RETURN_CODE);
    resultObject.returnCode = intReturnCode;
    if (intReturnCode >= 0) {
      switch (message.TOKEN_CMD_ORIGIN) {
        case Strings.TOKEN_CMD_GET_SERVER_VERSION:
          resultObject.serverVersion = message.TOKEN_PARAM_VERSION;
          resultObject.os = message.TOKEN_PARAM_OS;
          break;
        case Strings.TOKEN_CMD_GET_INTERFACE_VERSION:
          resultObject.interfaceVersion = message.TOKEN_PARAM_VERSION;
          break;
        case Strings.TOKEN_CMD_SET_INTERFACE_VERSION:
          // no further information in response here
          break;
        default:
          var defaultResult = STPadServerLibDefault.handleResponse(
            message,
            resultObject,
            intReturnCode
          );
          if (defaultResult == null) {
            var apiResult = STPadServerLibApi.handleResponse(
              message,
              resultObject,
              intReturnCode
            );
            if (apiResult == null) {
              STPadServerLibCommons.handleLogging(
                "Invalid command token: " + resultObject.command
              );
            } else {
              resultObject = apiResult;
            }
          } else {
            resultObject = defaultResult;
          }
      }
    } else {
      resultObject.errorMessage = message.TOKEN_PARAM_ERROR_DESCRIPTION;
      resultObject.errorCode = intReturnCode;
      delete resultObject["returnCode"];
    }
    context.pushResult(resultObject);
  }

  function handleSendEvent(data) {
    if (data.TOKEN_CMD == Strings.TOKEN_CMD_INCORRECT_COMMAND) {
      // console.log(data.TOKEN_PARAM_EXCEPTION_CAUSE);
    } else {
      var defaultResult = STPadServerLibDefault.handleSendEvent(data);
      if (defaultResult == null) {
        STPadServerLibApi.handleSendEvent(data);
      }
    }
  }

  context.defaultReject = function (reason) {
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.defaultReject(): reason = " + reason
    );
    return Promise.reject(reason);
  };

  context.pushResult = function (resultObject) {
    var i = 0;
    var result = _resultValues[resultObject.command + "_" + i];
    while (result != undefined) {
      i++;
      if (i > 50) {
        STPadServerLibCommons.handleLogging(
          "STPadServerLibCommons.pushResult(): " +
            JSON.stringify(resultObject) +
            " could not be pushed. Too many unresolved requests"
        );
        return;
      }
      result = _resultValues[resultObject.command + "_" + i];
    }
    _resultValues[resultObject.command + "_" + i] = resultObject;
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.pushResult() pushed " +
        JSON.stringify(resultObject) +
        " at index " +
        i
    );
  };

  context.grabResult = function (command) {
    var i = 0;
    var result = _resultValues[command + "_" + i];
    while (result == undefined) {
      i++;
      result = _resultValues[command + "_" + i];
      if (i > 50) {
        return null;
      }
    }
    delete _resultValues[command + "_" + i];
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.grabResult() grabbed " +
        JSON.stringify(result) +
        " from index " +
        i
    );
    return result;
  };

  context.createPromise = function (command) {
    STPadServerLibCommons.handleLogging(
      "STPadServerLibCommons.createPromise(): command = " + command
    );
    return new Promise(function (resolve, reject) {
      (function wait() {
        var result = context.grabResult(command);
        if (result != null) {
          if (0 <= result.returnCode) {
            STPadServerLibCommons.handleLogging(
              "STPadServerLibCommons.createPromise() calls resolve(" +
                JSON.stringify(result) +
                ")"
            );
            return resolve(result);
          } else {
            STPadServerLibCommons.handleLogging(
              "STPadServerLibCommons.createPromise() calls reject(" +
                JSON.stringify(result) +
                ")"
            );
            return reject(result);
          }
        }
        setTimeout(wait, 1);
      })();
    });
  };

  function compareVersion(target) {
    var compare = supportedInterfaceVersion.split(".");
    target = target.split(".");

    for (var i = 0; i < target.length; i++) {
      var t = parseInt(target[i]);
      var c = parseInt(compare[i]);
      if (t == c) {
        continue;
      } else {
        if (t < c) {
          return 1;
        } else {
          return -1;
        }
      }
    }
    return 0;
  }
})(STPadServerLibCommons);

var STPadServerLibApi = {};
(function (context) {
  // const (enums)
  context.SampleRateMode = {
    _125Hz: 0,
    _250Hz: 1,
    _500Hz: 2,
    _280Hz: 3,
  };

  context.TextAlignment = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
    LEFT_CENTERED_VERTICALLY: 3,
    CENTER_CENTERED_VERTICALLY: 4,
    RIGHT_CENTERED_VERTICALLY: 5,
    LEFT_NO_WRAP: 6,
    CENTER_NO_WRAP: 7,
    RIGHT_NO_WRAP: 8,
  };

  context.HotSpotMode = {
    INACTIVE: 0,
    ACTIVE: 1,
    INVERT_OFF: 2,
  };

  context.FileType = {
    TIFF: 0,
    PNG: 1,
    BMP: 2,
    JPEG: 3,
    GIF: 4,
  };

  context.HotSpotType = {
    SCROLL_DOWN: 0,
    SCROLL_UP: 1,
    SCROLL_RIGHT: 2,
    SCROLL_LEFT: 3,
    SCROLL_SCROLLABLE: 4,
  };

  context.EraseOption = {
    COMPLETE: 0,
    SIGNATURE: 1,
  };

  context.MeasurementUnit = {
    PIXELS: 0,
    MILLIMETRES: 1,
    INCHES: 2,
  };

  const Strings = {
    TOKEN_TYPE_REQUEST: "TOKEN_TYPE_REQUEST",

    // Device
    TOKEN_CMD_API_DEVICE_SET_COM_PORT: "TOKEN_CMD_API_DEVICE_SET_COM_PORT",
    TOKEN_CMD_API_DEVICE_GET_CONNECTION_TYPE:
      "TOKEN_CMD_API_DEVICE_GET_CONNECTION_TYPE",
    TOKEN_CMD_API_DEVICE_GET_COM_PORT: "TOKEN_CMD_API_DEVICE_GET_COM_PORT",
    TOKEN_CMD_API_DEVICE_GET_IP_ADDRESS: "TOKEN_CMD_API_DEVICE_GET_IP_ADDRESS",
    TOKEN_CMD_API_DEVICE_GET_COUNT: "TOKEN_CMD_API_DEVICE_GET_COUNT",
    TOKEN_CMD_API_DEVICE_GET_INFO: "TOKEN_CMD_API_DEVICE_GET_INFO",
    TOKEN_CMD_API_DEVICE_GET_VERSION: "TOKEN_CMD_API_DEVICE_GET_VERSION",
    TOKEN_CMD_API_DEVICE_OPEN: "TOKEN_CMD_API_DEVICE_OPEN",
    TOKEN_CMD_API_DEVICE_CLOSE: "TOKEN_CMD_API_DEVICE_CLOSE",
    TOKEN_CMD_API_DEVICE_GET_CAPABILITIES:
      "TOKEN_CMD_API_DEVICE_GET_CAPABILITIES",

    // Sensor
    TOKEN_CMD_API_SENSOR_GET_SAMPLE_RATE_MODE:
      "TOKEN_CMD_API_SENSOR_GET_SAMPLE_RATE_MODE",
    TOKEN_CMD_API_SENSOR_SET_SAMPLE_RATE_MODE:
      "TOKEN_CMD_API_SENSOR_SET_SAMPLE_RATE_MODE",
    TOKEN_CMD_API_SENSOR_SET_SIGN_RECT: "TOKEN_CMD_API_SENSOR_SET_SIGN_RECT",
    TOKEN_CMD_API_SENSOR_CLEAR_SIGN_RECT:
      "TOKEN_CMD_API_SENSOR_CLEAR_SIGN_RECT",
    TOKEN_CMD_API_SENSOR_SET_SCROLL_AREA:
      "TOKEN_CMD_API_SENSOR_SET_SCROLL_AREA",
    TOKEN_CMD_API_SENSOR_SET_PEN_SCROLLING_ENABLED:
      "TOKEN_CMD_API_SENSOR_SET_PEN_SCROLLING_ENABLED",
    TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT: "TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT",
    TOKEN_CMD_API_SENSOR_ADD_SCROLL_HOT_SPOT:
      "TOKEN_CMD_API_SENSOR_ADD_SCROLL_HOT_SPOT",
    TOKEN_CMD_API_SENSOR_SET_HOT_SPOT_MODE:
      "TOKEN_CMD_API_SENSOR_SET_HOT_SPOT_MODE",
    TOKEN_CMD_API_SENSOR_CLEAR_HOT_SPOTS:
      "TOKEN_CMD_API_SENSOR_CLEAR_HOT_SPOTS",
    TOKEN_CMD_API_SENSOR_HOT_SPOT_PRESSED:
      "TOKEN_CMD_API_SENSOR_HOT_SPOT_PRESSED",

    // Signature
    TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION:
      "TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION",
    TOKEN_CMD_API_SIGNATURE_START: "TOKEN_CMD_API_SIGNATURE_START",
    TOKEN_CMD_API_SIGNATURE_STOP: "TOKEN_CMD_API_SIGNATURE_STOP",
    TOKEN_CMD_API_SIGNATURE_CONFIRM: "TOKEN_CMD_API_SIGNATURE_CONFIRM",
    TOKEN_CMD_API_SIGNATURE_RETRY: "TOKEN_CMD_API_SIGNATURE_RETRY",
    TOKEN_CMD_API_SIGNATURE_CANCEL: "TOKEN_CMD_API_SIGNATURE_CANCEL",
    TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA:
      "TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA",
    TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX:
      "TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX",
    TOKEN_CMD_API_SIGNATURE_GET_BOUNDS: "TOKEN_CMD_API_SIGNATURE_GET_BOUNDS",
    TOKEN_CMD_API_SIGNATURE_GET_STATE: "TOKEN_CMD_API_SIGNATURE_GET_STATE",
    // workaround for STPadServer < 1.6.0.0
    TOKEN_CMD_SIGNATURE_SIGN_DATA: "TOKEN_CMD_SIGNATURE_SIGN_DATA",

    // Display
    TOKEN_CMD_API_DISPLAY_ERASE: "TOKEN_CMD_API_DISPLAY_ERASE",
    TOKEN_CMD_API_DISPLAY_ERASE_RECT: "TOKEN_CMD_API_DISPLAY_ERASE_RECT",
    TOKEN_CMD_API_DISPLAY_CONFIG_PEN: "TOKEN_CMD_API_DISPLAY_CONFIG_PEN",
    TOKEN_CMD_API_DISPLAY_SET_FONT: "TOKEN_CMD_API_DISPLAY_SET_FONT",
    TOKEN_CMD_API_DISPLAY_SET_FONT_COLOR:
      "TOKEN_CMD_API_DISPLAY_SET_FONT_COLOR",
    TOKEN_CMD_API_DISPLAY_SET_TARGET: "TOKEN_CMD_API_DISPLAY_SET_TARGET",
    TOKEN_CMD_API_DISPLAY_SET_TEXT: "TOKEN_CMD_API_DISPLAY_SET_TEXT",
    TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT:
      "TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT",
    TOKEN_CMD_API_DISPLAY_SET_IMAGE: "TOKEN_CMD_API_DISPLAY_SET_IMAGE",
    TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE:
      "TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE",
    TOKEN_CMD_API_DISPLAY_SET_OVERLAY_RECT:
      "TOKEN_CMD_API_DISPLAY_SET_OVERLAY_RECT",
    TOKEN_CMD_API_DISPLAY_SET_SCROLL_POS:
      "TOKEN_CMD_API_DISPLAY_SET_SCROLL_POS",
    TOKEN_CMD_API_DISPLAY_GET_SCROLL_POS:
      "TOKEN_CMD_API_DISPLAY_GET_SCROLL_POS",
    TOKEN_CMD_API_DISPLAY_SAVE_IMAGE_AS_STREAM:
      "TOKEN_CMD_API_DISPLAY_SAVE_IMAGE_AS_STREAM",
    TOKEN_CMD_API_DISPLAY_SET_STANDBY_IMAGE:
      "TOKEN_CMD_API_DISPLAY_SET_STANDBY_IMAGE",
    TOKEN_CMD_API_DISPLAY_CONFIG_SLIDE_SHOW_EX:
      "TOKEN_CMD_API_DISPLAY_CONFIG_SLIDE_SHOW_EX",
    TOKEN_CMD_API_DISPLAY_GET_STANDBY_ID:
      "TOKEN_CMD_API_DISPLAY_GET_STANDBY_ID",
    TOKEN_CMD_API_DISPLAY_GET_WIDTH: "TOKEN_CMD_API_DISPLAY_GET_WIDTH",
    TOKEN_CMD_API_DISPLAY_GET_HEIGHT: "TOKEN_CMD_API_DISPLAY_GET_HEIGHT",
    TOKEN_CMD_API_DISPLAY_GET_TARGET_WIDTH:
      "TOKEN_CMD_API_DISPLAY_GET_TARGET_WIDTH",
    TOKEN_CMD_API_DISPLAY_GET_TARGET_HEIGHT:
      "TOKEN_CMD_API_DISPLAY_GET_TARGET_HEIGHT",
    TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED:
      "TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED",
    TOKEN_CMD_API_DISPLAY_SET_SCROLL_SPEED:
      "TOKEN_CMD_API_DISPLAY_SET_SCROLL_SPEED",
    TOKEN_CMD_API_DISPLAY_GET_ROTATION: "TOKEN_CMD_API_DISPLAY_GET_ROTATION",
    TOKEN_CMD_API_DISPLAY_SET_ROTATION: "TOKEN_CMD_API_DISPLAY_SET_ROTATION",
    TOKEN_CMD_API_DISPLAY_SCROLL_POS_CHANGED:
      "TOKEN_CMD_API_DISPLAY_SCROLL_POS_CHANGED",
    TOKEN_CMD_API_DISPLAY_GET_RESOLUTION:
      "TOKEN_CMD_API_DISPLAY_GET_RESOLUTION",
    TOKEN_CMD_API_DISPLAY_SET_PDF: "TOKEN_CMD_API_DISPLAY_SET_PDF",

    // Pdf
    TOKEN_CMD_API_PDF_LOAD: "TOKEN_CMD_API_PDF_LOAD",
    TOKEN_CMD_API_PDF_GET_PAGE_COUNT: "TOKEN_CMD_API_PDF_GET_PAGE_COUNT",
    TOKEN_CMD_API_PDF_GET_WIDTH: "TOKEN_CMD_API_PDF_GET_WIDTH",
    TOKEN_CMD_API_PDF_GET_HEIGHT: "TOKEN_CMD_API_PDF_GET_HEIGHT",
    TOKEN_CMD_API_PDF_SELECT_RECT: "TOKEN_CMD_API_PDF_SELECT_RECT",
    TOKEN_CMD_API_PDF_ADD_IMAGE: "TOKEN_CMD_API_PDF_ADD_IMAGE",
    TOKEN_CMD_API_PDF_REMOVE_IMAGE: "TOKEN_CMD_API_PDF_REMOVE_IMAGE",

    // RSA
    TOKEN_CMD_API_RSA_GET_ENCRYPTION_CERT_ID:
      "TOKEN_CMD_API_RSA_GET_ENCRYPTION_CERT_ID",
    TOKEN_CMD_API_RSA_SET_ENCRYPTION_CERT_PW:
      "TOKEN_CMD_API_RSA_SET_ENCRYPTION_CERT_PW",
    TOKEN_CMD_API_RSA_GET_SIGN_DATA: "TOKEN_CMD_API_RSA_GET_SIGN_DATA",
    TOKEN_CMD_API_RSA_SET_HASH: "TOKEN_CMD_API_RSA_SET_HASH",
    TOKEN_CMD_API_RSA_SIGN_PW: "TOKEN_CMD_API_RSA_SIGN_PW",
    TOKEN_CMD_API_RSA_SAVE_SIGNING_CERT_AS_STREAM:
      "TOKEN_CMD_API_RSA_SAVE_SIGNING_CERT_AS_STREAM",

    // Events
    TOKEN_CMD_DISCONNECT: "TOKEN_CMD_DISCONNECT",
    TOKEN_CMD_SIGNATURE_POINT: "TOKEN_CMD_SIGNATURE_POINT",
  };

  // Device
  context.Device = {
    Params: {
      setComPort: function (portList) {
        if (portList === undefined || portList === null) {
          throw "Invalid value for mandatory parameter 'portList'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_SET_COM_PORT;
        this.TOKEN_PARAM_PORT_LIST = portList;
      },
      getConnectionType: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_CONNECTION_TYPE;
        this.TOKEN_PARAM_INDEX = index;
      },
      getComPort: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_COM_PORT;
        this.TOKEN_PARAM_INDEX = index;
      },
      getIpAddress: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_IP_ADDRESS;
        this.TOKEN_PARAM_INDEX = index;
      },
      getCount: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_COUNT;
      },
      getInfo: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_INFO;
        this.TOKEN_PARAM_INDEX = index;
      },
      getVersion: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_VERSION;
        this.TOKEN_PARAM_INDEX = index;
      },
      open: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_OPEN;
        this.TOKEN_PARAM_INDEX = index;

        this.setEraseDisplay = function (eraseDisplay) {
          if (eraseDisplay === undefined || eraseDisplay === null) {
            throw "'eraseDisplay' is undefined or null";
          }
          this.TOKEN_PARAM_ERASE_DISPLAY = eraseDisplay;
        };
      },
      close: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_CLOSE;
        this.TOKEN_PARAM_INDEX = index;
      },
      getCapabilities: function (index) {
        if (index === undefined || index === null) {
          throw "Invalid value for mandatory parameter 'index'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DEVICE_GET_CAPABILITIES;
        this.TOKEN_PARAM_INDEX = index;
      },
    },

    // Device functions
    setComPort: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_SET_COM_PORT
      );
    },
    getConnectionType: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_CONNECTION_TYPE
      );
    },
    getComPort: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_COM_PORT
      );
    },
    getIpAddress: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_IP_ADDRESS
      );
    },
    getCount: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Device.Params.getCount())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_COUNT
      );
    },
    getInfo: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_INFO
      );
    },
    getVersion: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_VERSION
      );
    },
    open: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_OPEN
      );
    },
    close: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_CLOSE
      );
    },
    getCapabilities: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DEVICE_GET_CAPABILITIES
      );
    },
  };

  // Sensor
  context.Sensor = {
    handleHotSpotPressed: function (message) {},
    handleDisplayScrollPosChanged: function (message) {},

    Params: {
      getSampleRateMode: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_GET_SAMPLE_RATE_MODE;
      },
      setSampleRateMode: function (mode) {
        if (mode === undefined || mode === null) {
          throw "Invalid value for mandatory parameter 'mode'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_SET_SAMPLE_RATE_MODE;
        this.TOKEN_PARAM_MODE = mode;
      },
      setSignRect: function (left, top, width, height) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_SET_SIGN_RECT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
      },
      clearSignRect: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_CLEAR_SIGN_RECT;
      },
      setScrollArea: function (left, top, width, height) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_SET_SCROLL_AREA;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
      },
      setPenScrollingEnabled: function (enabled) {
        if (enabled === undefined || enabled === null) {
          throw "Invalid value for mandatory parameter 'enabled'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_SET_PEN_SCROLLING_ENABLED;
        this.TOKEN_PARAM_ENABLE = enabled;
      },
      addHotSpot: function (left, top, width, height) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
      },
      addScrollHotSpot: function (left, top, width, height, type) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        if (type === undefined || type === null) {
          throw "Invalid value for mandatory parameter 'type'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_ADD_SCROLL_HOT_SPOT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
        this.TOKEN_PARAM_TYPE = type;
      },
      setHotSpotMode: function (hotSpotId, mode) {
        if (hotSpotId === undefined || hotSpotId === null) {
          throw "Invalid value for mandatory parameter 'hotSpotId'";
        }
        if (mode === undefined || mode === null) {
          throw "Invalid value for mandatory parameter 'mode'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_SET_HOT_SPOT_MODE;
        this.TOKEN_PARAM_HOTSPOT_ID = hotSpotId;
        this.TOKEN_PARAM_MODE = mode;
      },
      clearHotSpots: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SENSOR_CLEAR_HOT_SPOTS;
      },
    },

    // Sensor functions
    getSampleRateMode: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Sensor.Params.getSampleRateMode())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_GET_SAMPLE_RATE_MODE
      );
    },
    setSampleRateMode: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_SET_SAMPLE_RATE_MODE
      );
    },
    setSignRect: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_SET_SIGN_RECT
      );
    },
    clearSignRect: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Sensor.Params.clearSignRect())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_CLEAR_SIGN_RECT
      );
    },
    setScrollArea: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_SET_SCROLL_AREA
      );
    },
    setPenScrollingEnabled: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_SET_PEN_SCROLLING_ENABLED
      );
    },
    addHotSpot: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT
      );
    },
    addScrollHotSpot: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_ADD_SCROLL_HOT_SPOT
      );
    },
    setHotSpotMode: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_SET_HOT_SPOT_MODE
      );
    },
    clearHotSpots: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Sensor.Params.clearHotSpots())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SENSOR_CLEAR_HOT_SPOTS
      );
    },
  };

  // Signature
  context.Signature = {
    Params: {
      getResolution: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION;
      },
      start: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_START;
      },
      stop: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_STOP;
      },
      confirm: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_CONFIRM;
      },
      retry: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_RETRY;
      },
      cancel: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_CANCEL;

        this.setErase = function (erase) {
          if (erase === undefined || erase === null) {
            throw "'erase' is undefined or null";
          }
          this.TOKEN_PARAM_ERASE = erase;
        };
      },
      getSignData: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA;
      },
      saveAsStreamEx: function (
        resolution,
        width,
        height,
        fileType,
        penWidth,
        penColor,
        options
      ) {
        if (resolution === undefined || resolution === null) {
          throw "Invalid value for mandatory parameter 'resolution'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        if (fileType === undefined || fileType === null) {
          throw "Invalid value for mandatory parameter 'fileType'";
        }
        if (penWidth === undefined || penWidth === null) {
          throw "Invalid value for mandatory parameter 'penWidth'";
        }
        if (penColor === undefined || penColor === null) {
          throw "Invalid value for mandatory parameter 'penColor'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX;
        this.TOKEN_PARAM_RESOLUTION = resolution;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
        this.TOKEN_PARAM_FILE_TYPE = fileType;
        this.TOKEN_PARAM_PEN_WIDTH = penWidth;
        this.TOKEN_PARAM_PEN_COLOR = penColor;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      getBounds: function (options) {
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_GET_BOUNDS;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      getState: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_SIGNATURE_GET_STATE;
      },
    },

    // Signature functions
    getResolution: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.getResolution())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION
      );
    },
    start: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.start())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_START
      );
    },
    stop: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.stop())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_STOP
      );
    },
    confirm: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.confirm())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_CONFIRM
      );
    },
    retry: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.retry())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_RETRY
      );
    },
    cancel: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_CANCEL
      );
    },
    getSignData: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.getSignData())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA
      );
    },
    saveAsStreamEx: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX
      );
    },
    getBounds: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_GET_BOUNDS
      );
    },
    getState: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Signature.Params.getState())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_SIGNATURE_GET_STATE
      );
    },
  };

  // Display
  context.Display = {
    Params: {
      erase: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_ERASE;
      },
      eraseRect: function (left, top, width, height) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_ERASE_RECT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
      },
      configPen: function (width, color) {
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (color === undefined || color === null) {
          throw "Invalid value for mandatory parameter 'color'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_CONFIG_PEN;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_PEN_COLOR = color;
      },
      setFont: function (name, size, options) {
        if (name === undefined || name === null) {
          throw "Invalid value for mandatory parameter 'name'";
        }
        if (size === undefined || size === null) {
          throw "Invalid value for mandatory parameter 'size'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_FONT;
        this.TOKEN_PARAM_NAME = name;
        this.TOKEN_PARAM_SIZE = size;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      setFontColor: function (color) {
        if (color === undefined || color === null) {
          throw "Invalid value for mandatory parameter 'color'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_FONT_COLOR;
        this.TOKEN_PARAM_FONT_COLOR = color;
      },
      setTarget: function (target) {
        if (target === undefined || target === null) {
          throw "Invalid value for mandatory parameter 'target'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_TARGET;
        this.TOKEN_PARAM_TARGET = target;
      },
      setText: function (xPos, yPos, alignment, text) {
        if (xPos === undefined || xPos === null) {
          throw "Invalid value for mandatory parameter 'xPos'";
        }
        if (yPos === undefined || yPos === null) {
          throw "Invalid value for mandatory parameter 'yPos'";
        }
        if (alignment === undefined || alignment === null) {
          throw "Invalid value for mandatory parameter 'alignment'";
        }
        if (text === undefined || text === null) {
          throw "Invalid value for mandatory parameter 'text'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT;
        this.TOKEN_PARAM_X_POS = xPos;
        this.TOKEN_PARAM_Y_POS = yPos;
        this.TOKEN_PARAM_ALIGNMENT = alignment;
        this.TOKEN_PARAM_TEXT = text;
      },
      setTextInRect: function (
        left,
        top,
        width,
        height,
        alignment,
        text,
        options
      ) {
        if (text === undefined || text === null) {
          throw "Invalid value for mandatory parameter 'text'";
        }
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        if (alignment === undefined || alignment === null) {
          throw "Invalid value for mandatory parameter 'alignment'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
        this.TOKEN_PARAM_ALIGNMENT = alignment;
        this.TOKEN_PARAM_TEXT = text;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      setImage: function (xPos, yPos, bitmap) {
        if (xPos === undefined || xPos === null) {
          throw "Invalid value for mandatory parameter 'xPos'";
        }
        if (yPos === undefined || yPos === null) {
          throw "Invalid value for mandatory parameter 'yPos'";
        }
        if (bitmap === undefined || bitmap === null) {
          throw "Invalid value for mandatory parameter 'bitmap'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE;
        this.TOKEN_PARAM_X_POS = xPos;
        this.TOKEN_PARAM_Y_POS = yPos;
        this.TOKEN_PARAM_BITMAP = bitmap;
      },
      setImageFromStore: function (storeId) {
        if (storeId === undefined || storeId === null) {
          throw "Invalid value for mandatory parameter 'storeId'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE;
        this.TOKEN_PARAM_STORE_ID = storeId;
      },
      setOverlayRect: function (left, top, width, height) {
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_OVERLAY_RECT;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
      },
      setScrollPos: function (xPos, yPos) {
        if (xPos === undefined || xPos === null) {
          throw "Invalid value for mandatory parameter 'xPos'";
        }
        if (yPos === undefined || yPos === null) {
          throw "Invalid value for mandatory parameter 'yPos'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_SCROLL_POS;
        this.TOKEN_PARAM_X_POS = xPos;
        this.TOKEN_PARAM_Y_POS = yPos;
      },
      getScrollPos: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_POS;
      },
      saveImageAsStream: function (fileType, options) {
        if (fileType === undefined || fileType === null) {
          throw "Invalid value for mandatory parameter 'fileType'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SAVE_IMAGE_AS_STREAM;
        this.TOKEN_PARAM_FILE_TYPE = fileType;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      setStandbyImage: function (bitmap) {
        if (bitmap === undefined || bitmap === null) {
          throw "Invalid value for mandatory parameter 'bitmap'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_STANDBY_IMAGE;
        this.TOKEN_PARAM_BITMAP = bitmap;
      },
      configSlideShowEx: function (slideList, durationList) {
        if (slideList === undefined || slideList === null) {
          throw "Invalid value for mandatory parameter 'slideList'";
        }
        if (durationList === undefined || durationList === null) {
          throw "Invalid value for mandatory parameter 'durationList'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_CONFIG_SLIDE_SHOW_EX;
        this.TOKEN_PARAM_SLIDE_LIST = slideList;
        this.TOKEN_PARAM_DURATION_LIST = durationList;
      },
      getStandbyId: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_STANDBY_ID;
      },
      getWidth: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_WIDTH;
      },
      getHeight: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_HEIGHT;
      },
      getTargetWidth: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_WIDTH;
      },
      getTargetHeight: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_HEIGHT;
      },
      getScrollSpeed: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED;
      },
      setScrollSpeed: function (speed) {
        if (speed === undefined || speed === null) {
          throw "Invalid value for mandatory parameter 'speed'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED;
        this.TOKEN_PARAM_SPEED = speed;
      },
      getRotation: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_ROTATION;
      },
      setRotation: function (rotation) {
        if (rotation === undefined || rotation === null) {
          throw "Invalid value for mandatory parameter 'rotation'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_ROTATION;
        this.TOKEN_PARAM_ROTATION = rotation;
      },
      getResolution: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_GET_RESOLUTION;
      },
      setPDF: function (xPoss, yPoss, pages, scale, options) {
        if (xPoss === undefined || xPoss === null) {
          throw "Invalid value for mandatory parameter 'xPoss'";
        }
        if (yPoss === undefined || yPoss === null) {
          throw "Invalid value for mandatory parameter 'yPoss'";
        }
        if (pages === undefined || pages === null) {
          throw "Invalid value for mandatory parameter 'pages'";
        }
        if (scale === undefined || scale === null) {
          throw "Invalid value for mandatory parameter 'scale'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_DISPLAY_SET_PDF;
        this.TOKEN_PARAM_X_POS = xPoss;
        this.TOKEN_PARAM_Y_POS = yPoss;
        this.TOKEN_PARAM_PAGE = pages;
        this.TOKEN_PARAM_SCALE = scale;
        this.TOKEN_PARAM_OPTIONS = options;
      },
    },

    // Display Functions
    erase: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.erase())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_ERASE
      );
    },
    eraseRect: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_ERASE_RECT
      );
    },
    configPen: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_CONFIG_PEN
      );
    },
    setFont: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_FONT
      );
    },
    setFontColor: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_FONT_COLOR
      );
    },
    setTarget: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_TARGET
      );
    },
    setText: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT
      );
    },
    setTextInRect: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT
      );
    },
    setImage: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE
      );
    },
    setImageFromStore: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE
      );
    },
    setOverlayRect: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_OVERLAY_RECT
      );
    },
    setScrollPos: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_SCROLL_POS
      );
    },
    getScrollPos: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getScrollPos())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_POS
      );
    },
    saveImageAsStream: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SAVE_IMAGE_AS_STREAM
      );
    },
    setStandbyImage: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_STANDBY_IMAGE
      );
    },
    configSlideShowEx: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_CONFIG_SLIDE_SHOW_EX
      );
    },
    getStandbyId: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getStandbyId())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_STANDBY_ID
      );
    },
    getWidth: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getWidth())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_WIDTH
      );
    },
    getHeight: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getHeight())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_HEIGHT
      );
    },
    getTargetWidth: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getTargetWidth())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_WIDTH
      );
    },
    getTargetHeight: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getTargetHeight())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_HEIGHT
      );
    },
    getScrollSpeed: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getScrollSpeed())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED
      );
    },
    setScrollSpeed: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_SCROLL_SPEED
      );
    },
    getRotation: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getRotation())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_ROTATION
      );
    },
    setRotation: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_ROTATION
      );
    },
    getResolution: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Display.Params.getResolution())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_GET_RESOLUTION
      );
    },
    setPDF: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_DISPLAY_SET_PDF
      );
    },
  };

  // Pdf
  context.Pdf = {
    Params: {
      load: function (document) {
        if (document === undefined || document === null) {
          throw "Invalid value for mandatory parameter 'document'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_LOAD;
        this.TOKEN_PARAM_DOCUMENT = document;

        this.setPassword = function (password) {
          if (password === undefined || password === null) {
            throw "'password' is undefined or null";
          }
          this.TOKEN_PARAM_PASSWORD = password;
        };
      },
      getPageCount: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_GET_PAGE_COUNT;
      },
      getWidths: function (page, unit) {
        if (page === undefined || page === null) {
          throw "Invalid value for mandatory parameter 'page'";
        }
        if (unit === undefined || unit === null) {
          throw "Invalid value for mandatory parameter 'unit'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_GET_WIDTH;
        this.TOKEN_PARAM_PAGE = page;
        this.TOKEN_PARAM_UNIT = unit;
      },
      getHeights: function (page, unit) {
        if (page === undefined || page === null) {
          throw "Invalid value for mandatory parameter 'page'";
        }
        if (unit === undefined || unit === null) {
          throw "Invalid value for mandatory parameter 'unit'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_GET_HEIGHT;
        this.TOKEN_PARAM_PAGE = page;
        this.TOKEN_PARAM_UNIT = unit;
      },
      selectRect: function (page, left, top, width, height, unit) {
        if (page === undefined || page === null) {
          throw "Invalid value for mandatory parameter 'page'";
        }
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (width === undefined || width === null) {
          throw "Invalid value for mandatory parameter 'width'";
        }
        if (height === undefined || height === null) {
          throw "Invalid value for mandatory parameter 'height'";
        }
        if (unit === undefined || unit === null) {
          throw "Invalid value for mandatory parameter 'unit'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_SELECT_RECT;
        this.TOKEN_PARAM_PAGE = page;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_WIDTH = width;
        this.TOKEN_PARAM_HEIGHT = height;
        this.TOKEN_PARAM_UNIT = unit;
      },
      addImage: function (page, left, top, bitmap) {
        if (page === undefined || page === null) {
          throw "Invalid value for mandatory parameter 'page'";
        }
        if (left === undefined || left === null) {
          throw "Invalid value for mandatory parameter 'left'";
        }
        if (top === undefined || top === null) {
          throw "Invalid value for mandatory parameter 'top'";
        }
        if (bitmap === undefined || bitmap === null) {
          throw "Invalid value for mandatory parameter 'bitmap'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_ADD_IMAGE;
        this.TOKEN_PARAM_PAGE = page;
        this.TOKEN_PARAM_LEFT = left;
        this.TOKEN_PARAM_TOP = top;
        this.TOKEN_PARAM_BITMAP = bitmap;
      },
      removeImage: function (page, id) {
        if (page === undefined || page === null) {
          throw "Invalid value for mandatory parameter 'page'";
        }
        if (id === undefined || id === null) {
          throw "Invalid value for mandatory parameter 'id'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_PDF_REMOVE_IMAGE;
        this.TOKEN_PARAM_PAGE = page;
        this.TOKEN_PARAM_ID = id;
      },
    },

    // Pdf functions
    load: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_LOAD
      );
    },
    getPageCount: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Pdf.Params.getPageCount())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_GET_PAGE_COUNT
      );
    },
    getWidths: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_GET_WIDTH
      );
    },
    getHeights: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_GET_HEIGHT
      );
    },
    selectRect: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_SELECT_RECT
      );
    },
    addImage: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_ADD_IMAGE
      );
    },
    removeImage: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_PDF_REMOVE_IMAGE
      );
    },
  };

  // RSA
  context.RSA = {
    Params: {
      getEncryptionCertId: function () {
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_GET_ENCRYPTION_CERT_ID;
      },
      setEncryptionCertPw: function (encryption_cert, device_password) {
        if (encryption_cert === undefined || encryption_cert === null) {
          throw "Invalid value for mandatory parameter 'encryption_cert'";
        }
        if (device_password === undefined || device_password === null) {
          throw "Invalid value for mandatory parameter 'device_password'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_SET_ENCRYPTION_CERT_PW;
        this.TOKEN_PARAM_ENCRYPTION_CERT = encryption_cert;
        this.TOKEN_PARAM_DEVICE_PASSWORD = device_password;
      },
      getRSASignData: function (options) {
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_GET_SIGN_DATA;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      setHash: function (hash, hashalgo, options) {
        if (hash === undefined || hash === null) {
          throw "Invalid value for mandatory parameter 'hash'";
        }
        if (hashalgo === undefined || hashalgo === null) {
          throw "Invalid value for mandatory parameter 'hashalgo'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_SET_HASH;
        this.TOKEN_PARAM_HASH = hash;
        this.TOKEN_PARAM_HASHALGO = hashalgo;
        this.TOKEN_PARAM_OPTIONS = options;
      },
      signPw: function (rsascheme, hashvalue, options, signpassword) {
        if (rsascheme === undefined || rsascheme === null) {
          throw "Invalid value for mandatory parameter 'rsascheme'";
        }
        if (hashvalue === undefined || hashvalue === null) {
          throw "Invalid value for mandatory parameter 'hashvalue'";
        }
        if (options === undefined || options === null) {
          throw "Invalid value for mandatory parameter 'options'";
        }
        if (signpassword === undefined || signpassword === null) {
          throw "Invalid value for mandatory parameter 'signpassword'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_SIGN_PW;
        this.TOKEN_PARAM_RSA_SCHEME = rsascheme;
        this.TOKEN_PARAM_HASHVALUE = hashvalue;
        this.TOKEN_PARAM_OPTIONS = options;
        this.TOKEN_PARAM_SIGN_PASSWORD = signpassword;
      },
      saveSigningCertAsStream: function (certtype) {
        if (certtype === undefined || certtype === null) {
          throw "Invalid value for mandatory parameter 'certtype'";
        }
        this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
        this.TOKEN_CMD = Strings.TOKEN_CMD_API_RSA_SAVE_SIGNING_CERT_AS_STREAM;
        this.TOKEN_PARAM_CERTTYPE = certtype;
      },
    },

    // RSA functions
    getEncryptionCertId: function () {
      STPadServerLibCommons.send(
        JSON.stringify(new context.RSA.Params.getEncryptionCertId())
      );
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_GET_ENCRYPTION_CERT_ID
      );
    },
    setEncryptionCertPw: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_SET_ENCRYPTION_CERT_PW
      );
    },
    getRSASignData: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_GET_SIGN_DATA
      );
    },
    setHash: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_SET_HASH
      );
    },
    signPw: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_SIGN_PW
      );
    },
    saveSigningCertAsStream: function (params) {
      STPadServerLibCommons.send(JSON.stringify(params));
      return STPadServerLibCommons.createPromise(
        Strings.TOKEN_CMD_API_RSA_SAVE_SIGNING_CERT_AS_STREAM
      );
    },
  };

  context.handleResponse = function (message, resultObject, intReturnCode) {
    switch (message.TOKEN_CMD_ORIGIN) {
      case Strings.TOKEN_CMD_API_DEVICE_GET_CONNECTION_TYPE:
        resultObject.connectionType = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_COM_PORT:
        resultObject.comPort = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_IP_ADDRESS:
        resultObject.ipAddress = message.TOKEN_PARAM_IPADDRESS;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_COUNT:
        resultObject.countedDevices = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_INFO:
        resultObject.serial = message.TOKEN_PARAM_SERIAL;
        resultObject.type = parseInt(message.TOKEN_PARAM_TYPE);
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_VERSION:
        resultObject.version = message.TOKEN_PARAM_VERSION;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_GET_CAPABILITIES:
        resultObject.capabilities = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_SENSOR_GET_SAMPLE_RATE_MODE:
        resultObject.sampleRateMode = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_SENSOR_ADD_HOT_SPOT:
      case Strings.TOKEN_CMD_API_SENSOR_ADD_SCROLL_HOT_SPOT:
        resultObject.hotspotId = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_STOP:
      case Strings.TOKEN_CMD_API_SIGNATURE_CONFIRM:
        resultObject.countedPoints = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_GET_RESOLUTION:
        resultObject.xResolution = parseInt(
          message.TOKEN_PARAM_PAD_X_RESOLUTION
        );
        resultObject.yResolution = parseInt(
          message.TOKEN_PARAM_PAD_Y_RESOLUTION
        );
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA:
        resultObject.signData = message.TOKEN_PARAM_SIGN_DATA;
        break;
      case Strings.TOKEN_CMD_SIGNATURE_SIGN_DATA:
        // workaround for STPadServer < 1.6.0.0
        resultObject.signData = message.TOKEN_PARAM_SIGNATURE_SIGN_DATA;
        message.TOKEN_CMD_ORIGIN =
          Strings.TOKEN_CMD_API_SIGNATURE_GET_SIGN_DATA;
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_SAVE_AS_STREAM_EX:
        resultObject.image = message.TOKEN_PARAM_IMAGE;
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_GET_BOUNDS:
        resultObject.left = parseInt(message.TOKEN_PARAM_LEFT);
        resultObject.top = parseInt(message.TOKEN_PARAM_TOP);
        resultObject.right = parseInt(message.TOKEN_PARAM_RIGHT);
        resultObject.bottom = parseInt(message.TOKEN_PARAM_BOTTOM);
        break;
      case Strings.TOKEN_CMD_API_SIGNATURE_GET_STATE:
        resultObject.state = intReturnCode !== 0;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SET_TARGET:
        resultObject.targetId = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT:
        resultObject.textWidth = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SET_TEXT_IN_RECT:
        resultObject.fontSizeOrTextHeight = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE_FROM_STORE:
        resultObject.storeId = intReturnCode;
        if (intReturnCode > 0) {
          resultObject.warn =
            "Storage was not reserved beforehand. You possibly need " +
            "to redo the operation for this component.";
        }
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_POS:
        resultObject.xPos = parseInt(message.TOKEN_PARAM_X_POS);
        resultObject.yPos = parseInt(message.TOKEN_PARAM_Y_POS);
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SAVE_IMAGE_AS_STREAM:
        resultObject.image = message.TOKEN_PARAM_IMAGE;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_CONFIG_SLIDE_SHOW_EX:
        resultObject.imageCount = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_STANDBY_ID:
        resultObject.numberOfStorages = intReturnCode;
        resultObject.id = message.TOKEN_PARAM_ID;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_WIDTH:
        resultObject.width = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_HEIGHT:
        resultObject.height = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_WIDTH:
        resultObject.targetWidth = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_TARGET_HEIGHT:
        resultObject.targetHeight = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_SCROLL_SPEED:
        resultObject.speed = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_ROTATION:
        resultObject.rotation = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_GET_RESOLUTION:
        resultObject.resolution = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_PDF_GET_PAGE_COUNT:
        resultObject.pageCount = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_PDF_GET_WIDTH:
        resultObject.widths = message.TOKEN_PARAM_RETURN_CODE;
        break;
      case Strings.TOKEN_CMD_API_PDF_GET_HEIGHT:
        resultObject.heights = message.TOKEN_PARAM_RETURN_CODE;
        break;
      case Strings.TOKEN_CMD_API_PDF_ADD_IMAGE:
        resultObject.id = intReturnCode;
        break;
      case Strings.TOKEN_CMD_API_DISPLAY_SET_PDF:
        resultObject.rets = message.TOKEN_PARAM_RETURN_CODE;
        break;
      case Strings.TOKEN_CMD_API_RSA_GET_ENCRYPTION_CERT_ID:
        resultObject.encryptionCertId = message.TOKEN_PARAM_ENCRYPTION_CERT_ID;
        break;
      case Strings.TOKEN_CMD_API_RSA_GET_SIGN_DATA:
        resultObject.rsaSignData = message.TOKEN_PARAM_SIGN_DATA;
        break;
      case Strings.TOKEN_CMD_API_RSA_SIGN_PW:
        resultObject.rsaSignature = message.TOKEN_PARAM_RSA_SIGNATURE;
        break;
      case Strings.TOKEN_CMD_API_RSA_SAVE_SIGNING_CERT_AS_STREAM:
        resultObject.signingCert = message.TOKEN_PARAM_SIGNING_CERT;
        break;
      case Strings.TOKEN_CMD_API_DEVICE_SET_COM_PORT:
      case Strings.TOKEN_CMD_API_SENSOR_SET_SAMPLE_RATE_MODE:
      case Strings.TOKEN_CMD_API_SENSOR_SET_SIGN_RECT:
      case Strings.TOKEN_CMD_API_DEVICE_OPEN:
      case Strings.TOKEN_CMD_API_DEVICE_CLOSE:
      case Strings.TOKEN_CMD_API_SENSOR_CLEAR_SIGN_RECT:
      case Strings.TOKEN_CMD_API_SENSOR_SET_SCROLL_AREA:
      case Strings.TOKEN_CMD_API_SENSOR_SET_PEN_SCROLLING_ENABLED:
      case Strings.TOKEN_CMD_API_SENSOR_SET_HOT_SPOT_MODE:
      case Strings.TOKEN_CMD_API_SENSOR_CLEAR_HOT_SPOTS:
      case Strings.TOKEN_CMD_API_SIGNATURE_START:
      case Strings.TOKEN_CMD_API_SIGNATURE_RETRY:
      case Strings.TOKEN_CMD_API_SIGNATURE_CANCEL:
      case Strings.TOKEN_CMD_API_DISPLAY_ERASE:
      case Strings.TOKEN_CMD_API_DISPLAY_ERASE_RECT:
      case Strings.TOKEN_CMD_API_DISPLAY_CONFIG_PEN:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_IMAGE:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_FONT:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_FONT_COLOR:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_OVERLAY_RECT:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_SCROLL_POS:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_SCROLL_SPEED:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_STANDBY_IMAGE:
      case Strings.TOKEN_CMD_API_DISPLAY_SET_ROTATION:
      case Strings.TOKEN_CMD_API_PDF_LOAD:
      case Strings.TOKEN_CMD_API_PDF_SELECT_RECT:
      case Strings.TOKEN_CMD_API_PDF_REMOVE_IMAGE:
      case Strings.TOKEN_CMD_API_RSA_SET_ENCRYPTION_CERT_PW:
      case Strings.TOKEN_CMD_API_RSA_SET_HASH:
        // none
        break;
      default:
        return null;
    }
    return resultObject;
  };

  context.handleSendEvent = function (message) {
    switch (message.TOKEN_CMD) {
      case Strings.TOKEN_CMD_SIGNATURE_POINT:
        var x = parseInt(message.TOKEN_PARAM_POINT["x"]);
        var y = parseInt(message.TOKEN_PARAM_POINT["y"]);
        var p = parseInt(message.TOKEN_PARAM_POINT["p"]);
        STPadServerLibCommons.handleNextSignaturePoint(x, y, p);
        break;
      case Strings.TOKEN_CMD_DISCONNECT:
        STPadServerLibCommons.handleDisconnect(message.TOKEN_PARAM_PAD_INDEX);
        break;
      default:
        eventQueue.enqueue(message);
    }
  };

  const EventQueue = function () {
    this.queue = [];
    this.contentMap = new Map();
    this.enqueue = function (item) {
      STPadServerLibCommons.handleLogging(
        "STPadServerLibApi.EventQueue.enqueue(): item = " + JSON.stringify(item)
      );
      if (this.contentMap.has(item.TOKEN_CMD)) {
        var index = this.queue.indexOf(item.TOKEN_CMD);
        this.queue.splice(index, 1);
      }
      this.queue = this.queue.concat(item.TOKEN_CMD);
      this.contentMap.set(item.TOKEN_CMD, item);
    };
    this.dequeue = function () {
      if (this.isEmpty()) {
        return null;
      }
      var item = this.queue.shift();
      var content = this.contentMap.get(item);
      this.contentMap.delete(item);
      STPadServerLibCommons.handleLogging(
        "STPadServerLibApi.EventQueue.dequeue() returns " +
          JSON.stringify(content)
      );
      return content;
    };
    this.isEmpty = function () {
      return this.queue.length == 0;
    };
    this.printQueue = function () {
      var res = " | ";
      for (var i = 0; i < this.queue.length; i++)
        res += JSON.stringify(this.contentMap.get(this.queue[i])) + " | ";
      return res;
    };
  };

  var eventQueue = new EventQueue();
  var triggerNextEvent = true;
  (function trigger() {
    if (triggerNextEvent) {
      Promise.resolve()
        .then(function () {
          var nextEvent = eventQueue.dequeue();
          if (nextEvent == null) {
            return Promise.resolve();
          }
          triggerNextEvent = false;
          STPadServerLibCommons.handleLogging(
            "STPadServerLibApi.trigger() handles " + JSON.stringify(nextEvent)
          );
          switch (nextEvent.TOKEN_CMD) {
            case Strings.TOKEN_CMD_API_SENSOR_HOT_SPOT_PRESSED:
              return context.Sensor.handleHotSpotPressed(
                parseInt(nextEvent.TOKEN_PARAM_HOTSPOT_ID)
              );
            case Strings.TOKEN_CMD_API_DISPLAY_SCROLL_POS_CHANGED:
              return context.Sensor.handleDisplayScrollPosChanged(
                parseInt(nextEvent.TOKEN_PARAM_X_POS),
                parseInt(nextEvent.TOKEN_PARAM_Y_POS)
              );
            case Strings.TOKEN_CMD_DISCONNECT:
              return STPadServerLibCommons.handleDisconnect(
                nextEvent.TOKEN_PARAM_INDEX
              );
            default:
              STPadServerLibCommons.handleLogging(
                "STPadServerLibApi.trigger() can't handle " +
                  JSON.stringify(nextEvent)
              );
              return Promise.resolve();
          }
        }, STPadServerLibCommons.defaultReject)
        .then(
          function () {
            triggerNextEvent = true;
          },
          function (reason) {
            STPadServerLibCommons.handleLogging(
              "STPadServerLibApi.trigger() failed because of " +
                JSON.stringify(reason)
            );
            triggerNextEvent = true;
          }
        );
    }
    setTimeout(trigger, 1);
  })();
})(STPadServerLibApi);

export var STPadServerLibDefault = {};
(function (context) {
  context.handleRetrySignature = function (message) {};
  context.handleConfirmSignature = function (message) {};
  context.handleCancelSignature = function (message) {};
  context.handleConfirmSelection = function (message) {};
  context.handleCancelSelection = function (message) {};
  context.handleSelectionChange = function (message) {};

  // const (enums)
  context.FileType = {
    TIFF: 0,
    PNG: 1,
    BMP: 2,
    JPEG: 3,
    GIF: 4,
  };

  context.FontStyle = {
    BOLD: "BOLD",
    ITALIC: "ITALIC",
    UNDERLINE: "UNDERLINE",
  };

  context.RsaScheme = {
    None: "NONE",
    NoOID: "NO_HASH_OID",
    PKCS1_V1_5: "PKCS1_V1_5",
    PSS: "PSS",
  };

  const Strings = {
    TOKEN_TYPE_REQUEST: "TOKEN_TYPE_REQUEST",
    TOKEN_CMD_SEARCH_FOR_PADS: "TOKEN_CMD_SEARCH_FOR_PADS",
    TOKEN_CMD_OPEN_PAD: "TOKEN_CMD_OPEN_PAD",
    TOKEN_CMD_CLOSE_PAD: "TOKEN_CMD_CLOSE_PAD",
    TOKEN_CMD_SIGNATURE_START: "TOKEN_CMD_SIGNATURE_START",
    TOKEN_CMD_SIGNATURE_CANCEL: "TOKEN_CMD_SIGNATURE_CANCEL",
    TOKEN_CMD_SIGNATURE_RETRY: "TOKEN_CMD_SIGNATURE_RETRY",
    TOKEN_CMD_SIGNATURE_CONFIRM: "TOKEN_CMD_SIGNATURE_CONFIRM",
    TOKEN_CMD_SIGNATURE_SIGN_DATA: "TOKEN_CMD_SIGNATURE_SIGN_DATA",
    TOKEN_CMD_SIGNATURE_IMAGE: "TOKEN_CMD_SIGNATURE_IMAGE",
    TOKEN_CMD_SIGNING_CERT: "TOKEN_CMD_SIGNING_CERT",
    TOKEN_CMD_SIGNATURE_POINT: "TOKEN_CMD_SIGNATURE_POINT",
    TOKEN_CMD_SELECTION_DIALOG: "TOKEN_CMD_SELECTION_DIALOG",
    TOKEN_CMD_SELECTION_CHANGE: "TOKEN_CMD_SELECTION_CHANGE",
    TOKEN_CMD_SELECTION_CONFIRM: "TOKEN_CMD_SELECTION_CONFIRM",
    TOKEN_CMD_SIGNATURE_STOP: "TOKEN_CMD_SIGNATURE_STOP",
    TOKEN_CMD_SELECTION_CANCEL: "TOKEN_CMD_SELECTION_CANCEL",
    TOKEN_CMD_DISCONNECT: "TOKEN_CMD_DISCONNECT",
    TOKEN_CMD_ERROR: "TOKEN_CMD_ERROR",

    TOKEN_PARAM_CONNECTED_PADS: "TOKEN_PARAM_CONNECTED_PADS",
    TOKEN_PARAM_LAYOUT_ID: "TOKEN_PARAM_LAYOUT_ID",
    TOKEN_PARAM_TEXT_BLOCKS: "TOKEN_PARAM_TEXT_BLOCKS",
    TOKEN_PARAM_TEXT: "TOKEN_PARAM_TEXT",
    TOKEN_PARAM_WIDTH: "TOKEN_PARAM_WIDTH",
    TOKEN_PARAM_HEIGHT: "TOKEN_PARAM_HEIGHT",
    TOKEN_PARAM_FONT_NAME: "TOKEN_PARAM_FONT_NAME",
    TOKEN_PARAM_FONT_STYLE: "TOKEN_PARAM_FONT_STYLE",
    TOKEN_PARAM_MAX_FONT_SIZE: "TOKEN_PARAM_MAX_FONT_SIZE",
    TOKEN_PARAM_FONT_SIZE_ID: "TOKEN_PARAM_FONT_SIZE_ID",
    TOKEN_PARAM_CONSTANT: "TOKEN_PARAM_CONSTANT",
    TOKEN_PARAM_FIELD_LIST: "TOKEN_PARAM_FIELD_LIST",
    TOKEN_PARAM_FIELD_ID: "TOKEN_PARAM_FIELD_ID",
    TOKEN_PARAM_FIELD_TEXT: "TOKEN_PARAM_FIELD_TEXT",
    TOKEN_PARAM_FIELD_CHECKED: "TOKEN_PARAM_FIELD_CHECKED",
    TOKEN_PARAM_FIELD_REQUIRED: "TOKEN_PARAM_FIELD_REQUIRED",
  };

  context.Params = {
    searchForPads: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SEARCH_FOR_PADS;

      this.setPadSubset = function (padSubset) {
        if (padSubset === undefined || padSubset === null) {
          throw "'padSubset' is undefined or null";
        }
        this.TOKEN_PARAM_PAD_SUBSET = padSubset;
      };
    },
    openPad: function (index) {
      if (index === undefined || index === null) {
        throw "Invalid value for mandatory parameter 'index'";
      }
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_OPEN_PAD;
      this.TOKEN_PARAM_PAD_INDEX = index;
    },
    closePad: function (index) {
      if (index === undefined || index === null) {
        throw "Invalid value for mandatory parameter 'index'";
      }
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_CLOSE_PAD;
      this.TOKEN_PARAM_PAD_INDEX = index;
    },
    startSignature: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_START;
      this.TOKEN_PARAM_PAD_ENCRYPTION = "FALSE";

      this.setFieldName = function (fieldName) {
        if (fieldName === undefined || fieldName === null) {
          throw "'fieldName' is undefined or null";
        }
        this.TOKEN_PARAM_FIELD_NAME = fieldName;
      };

      this.setCustomText = function (customText) {
        if (customText === undefined || customText === null) {
          throw "'customText' is undefined or null";
        }
        this.TOKEN_PARAM_CUSTOM_TEXT = customText;
      };

      this.enablePadEncryption = function (
        docHash,
        encryptionCert,
        encryptionCertOnlyWhenEmpty
      ) {
        this.TOKEN_PARAM_PAD_ENCRYPTION = "TRUE";
        if (docHash === undefined || docHash === null) {
          // do nothing (optional)
        } else {
          this.TOKEN_PARAM_DOCHASH = docHash;
        }
        if (encryptionCert === undefined || encryptionCert === null) {
          // do nothing (optional)
        } else {
          this.TOKEN_PARAM_ENCRYPTION_CERT = encryptionCert;
        }
        if (
          encryptionCertOnlyWhenEmpty === undefined ||
          encryptionCertOnlyWhenEmpty === null
        ) {
          // do nothing (optional)
        } else {
          this.TOKEN_PARAM_ENCRYPTION_CERT_ONLY_WHEN_EMPTY =
            encryptionCertOnlyWhenEmpty;
        }
      };

      this.setDialogImage = function (dialogImage) {
        if (dialogImage === undefined || dialogImage === null) {
          throw "'dialogImage' is undefined or null";
        }
        this.TOKEN_PARAM_PAD_DIALOG_IMAGE = dialogImage;
      };

      this.setTextLayout = function (textLayout) {
        if (textLayout === undefined || textLayout === null) {
          throw "'textLayout' is undefined or null";
        }
        var layout = {};
        layout[Strings.TOKEN_PARAM_LAYOUT_ID] = textLayout.id;
        var textBlocks = [];
        for (var i = 0; i < textLayout.textBlocks.length; i++) {
          var textBlock = {};
          textBlock[Strings.TOKEN_PARAM_TEXT] = textLayout.textBlocks[i].text;
          textBlock[Strings.TOKEN_PARAM_WIDTH] = textLayout.textBlocks[i].width;
          textBlock[Strings.TOKEN_PARAM_HEIGHT] =
            textLayout.textBlocks[i].height;
          textBlock[Strings.TOKEN_PARAM_FONT_NAME] =
            textLayout.textBlocks[i].fontName;
          textBlock[Strings.TOKEN_PARAM_FONT_STYLE] =
            textLayout.textBlocks[i].fontStyle;
          textBlock[Strings.TOKEN_PARAM_MAX_FONT_SIZE] =
            textLayout.textBlocks[i].maxFontSize;
          textBlock[Strings.TOKEN_PARAM_FONT_SIZE_ID] =
            textLayout.textBlocks[i].fontSizeId;
          textBlock[Strings.TOKEN_PARAM_CONSTANT] =
            textLayout.textBlocks[i].constant;
          textBlocks.push(textBlock);
        }
        layout[Strings.TOKEN_PARAM_TEXT_BLOCKS] = textBlocks;
        this.TOKEN_PARAM_TEXT_LAYOUT = layout;
      };
    },
    cancelSignature: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_CANCEL;
    },
    retrySignature: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_RETRY;
    },
    confirmSignature: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_CONFIRM;
    },
    stopSignature: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_STOP;
    },
    startSelectionDialog: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SELECTION_DIALOG;

      this.addCheckboxInformation = function (cbInformation) {
        if (cbInformation === undefined || cbInformation === null) {
          throw "'cbInformation' is undefined or null";
        }
        var cbArray = [];
        for (var i = 0; i < cbInformation.length; i++) {
          var checkbox = {};
          checkbox[Strings.TOKEN_PARAM_FIELD_ID] = cbInformation[i].id;
          checkbox[Strings.TOKEN_PARAM_FIELD_TEXT] = cbInformation[i].text;
          checkbox[Strings.TOKEN_PARAM_FIELD_CHECKED] =
            cbInformation[i].checked;
          checkbox[Strings.TOKEN_PARAM_FIELD_REQUIRED] =
            cbInformation[i].required;
          cbArray.push(checkbox);
        }
        this.TOKEN_PARAM_FIELD_LIST = cbArray;
      };
    },
    getSignatureData: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_SIGN_DATA;

      this.setRsaScheme = function (rsaScheme) {
        if (rsaScheme === undefined || rsaScheme === null) {
          throw "'rsaScheme' is undefined or null";
        }
        this.TOKEN_PARAM_SIGNATURE_RSA_SCHEME = rsaScheme;
      };
    },
    getSignatureImage: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNATURE_IMAGE;

      this.setFileType = function (fileType) {
        if (fileType === undefined || fileType === null) {
          throw "'fileType' is undefined or null";
        }
        this.TOKEN_PARAM_FILE_TYPE = fileType;
      };

      this.setPenWidth = function (penWidth) {
        if (penWidth === undefined || penWidth === null) {
          throw "'penWidth' is undefined or null";
        }
        this.TOKEN_PARAM_PEN_WIDTH = penWidth;
      };
    },
    getSigningCert: function () {
      this.TOKEN_TYPE = Strings.TOKEN_TYPE_REQUEST;
      this.TOKEN_CMD = Strings.TOKEN_CMD_SIGNING_CERT;
    },
  };

  context.searchForPads = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SEARCH_FOR_PADS
    );
  };
  context.openPad = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(Strings.TOKEN_CMD_OPEN_PAD);
  };
  context.closePad = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(Strings.TOKEN_CMD_CLOSE_PAD);
  };
  context.startSignature = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_START
    );
  };
  context.cancelSignature = function () {
    STPadServerLibCommons.send(
      JSON.stringify(new context.Params.cancelSignature())
    );
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_CANCEL
    );
  };
  context.retrySignature = function () {
    STPadServerLibCommons.send(
      JSON.stringify(new context.Params.retrySignature())
    );
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_RETRY
    );
  };
  context.confirmSignature = function () {
    STPadServerLibCommons.send(
      JSON.stringify(new context.Params.confirmSignature())
    );
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_CONFIRM
    );
  };
  context.stopSignature = function () {
    STPadServerLibCommons.send(
      JSON.stringify(new context.Params.stopSignature())
    );
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_STOP
    );
  };
  context.startSelectionDialog = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SELECTION_DIALOG
    );
  };
  context.getSignatureData = function (params) {
    if (params === undefined || params === null) {
      STPadServerLibCommons.send(
        JSON.stringify(new context.Params.getSignatureData())
      );
    } else {
      STPadServerLibCommons.send(JSON.stringify(params));
    }
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_SIGN_DATA
    );
  };
  context.getSignatureImage = function (params) {
    STPadServerLibCommons.send(JSON.stringify(params));
    return STPadServerLibCommons.createPromise(
      Strings.TOKEN_CMD_SIGNATURE_IMAGE
    );
  };
  context.getSigningCert = function () {
    STPadServerLibCommons.send(
      JSON.stringify(new context.Params.getSigningCert())
    );
    return STPadServerLibCommons.createPromise(Strings.TOKEN_CMD_SIGNING_CERT);
  };

  context.handleResponse = function (message, resultObject, intReturnCode) {
    switch (message.TOKEN_CMD_ORIGIN) {
      case Strings.TOKEN_CMD_SEARCH_FOR_PADS:
        var foundPads = [];
        var pads = message[Strings.TOKEN_PARAM_CONNECTED_PADS];
        if (pads) {
          for (var i = 0; i < pads.length; i++) {
            var padInfo = {};
            padInfo.index = pads[i].TOKEN_PARAM_PAD_INDEX;
            padInfo.type = parseInt(pads[i].TOKEN_PARAM_PAD_TYPE);
            padInfo.comPort = pads[i].TOKEN_PARAM_PAD_COM_PORT;
            padInfo.connectionType = pads[i].TOKEN_PARAM_PAD_CONNECTION_TYPE;
            padInfo.firmwareVersion = pads[i].TOKEN_PARAM_PAD_FIRMWARE_VERSION;
            padInfo.ipAddress = pads[i].TOKEN_PARAM_PAD_IP_ADDRESS;
            padInfo.serialNumber = pads[i].TOKEN_PARAM_PAD_SERIAL_NUMBER;
            padInfo.capabilities = pads[i].TOKEN_PARAM_PAD_CAPABILITIES;
            foundPads[i] = padInfo;
          }
        }
        resultObject.foundPads = foundPads;
        break;
      case Strings.TOKEN_CMD_OPEN_PAD:
        var padData = {};
        padData.displayWidth = parseInt(message.TOKEN_PARAM_PAD_DISPLAY_WIDTH);
        padData.displayHeight = parseInt(
          message.TOKEN_PARAM_PAD_DISPLAY_HEIGHT
        );
        padData.xResolution = parseInt(message.TOKEN_PARAM_PAD_X_RESOLUTION);
        padData.yResolution = parseInt(message.TOKEN_PARAM_PAD_Y_RESOLUTION);
        padData.samplingRate = parseInt(message.TOKEN_PARAM_PAD_SAMPLING_RATE);
        padData.dialogWidth = parseInt(message.TOKEN_PARAM_PAD_DIALOG_WIDTH);
        padData.dialogHeight = parseInt(message.TOKEN_PARAM_PAD_DIALOG_HEIGHT);
        padData.displayResolution = parseInt(
          message.TOKEN_PARAM_PAD_DISPLAY_RESOLUTION
        );
        resultObject.padInfo = padData;
        break;
      case Strings.TOKEN_CMD_SIGNATURE_CONFIRM:
        resultObject.countedPoints = intReturnCode;
        break;
      case Strings.TOKEN_CMD_SIGNATURE_START:
      case Strings.TOKEN_CMD_SELECTION_DIALOG:
      case Strings.TOKEN_CMD_SIGNATURE_CANCEL:
      case Strings.TOKEN_CMD_CLOSE_PAD:
      case Strings.TOKEN_CMD_SIGNATURE_RETRY:
        // no further information in response here
        break;
      case Strings.TOKEN_CMD_SIGNATURE_SIGN_DATA:
        resultObject.signData = message.TOKEN_PARAM_SIGNATURE_SIGN_DATA;
        resultObject.certId = message.TOKEN_PARAM_CERT_ID;
        resultObject.rsaSignature = message.TOKEN_PARAM_SIGNATURE_RSA_SIGNATURE;
        break;
      case Strings.TOKEN_CMD_SIGNATURE_IMAGE:
        resultObject.file = message.TOKEN_PARAM_FILE;
        break;
      case Strings.TOKEN_CMD_SIGNING_CERT:
        resultObject.signingCert = message.TOKEN_PARAM_SIGNING_CERT;
        break;
      default:
        return null;
    }
    return resultObject;
  };

  context.handleSendEvent = function (message) {
    switch (message.TOKEN_CMD) {
      case Strings.TOKEN_CMD_SIGNATURE_POINT:
        var x = parseInt(message.TOKEN_PARAM_POINT["x"]);
        var y = parseInt(message.TOKEN_PARAM_POINT["y"]);
        var p = parseInt(message.TOKEN_PARAM_POINT["p"]);
        STPadServerLibCommons.handleNextSignaturePoint(x, y, p);
        break;
      case Strings.TOKEN_CMD_SIGNATURE_CANCEL:
        context.handleCancelSignature();
        break;
      case Strings.TOKEN_CMD_SIGNATURE_RETRY:
        context.handleRetrySignature();
        break;
      case Strings.TOKEN_CMD_SIGNATURE_CONFIRM:
        context.handleConfirmSignature();
        break;
      case Strings.TOKEN_CMD_SELECTION_CANCEL:
        context.handleCancelSelection();
        break;
      case Strings.TOKEN_CMD_SELECTION_CONFIRM:
        context.handleConfirmSelection();
        break;
      case Strings.TOKEN_CMD_DISCONNECT:
        STPadServerLibCommons.handleDisconnect(message.TOKEN_PARAM_PAD_INDEX);
        break;
      case Strings.TOKEN_CMD_SELECTION_CHANGE:
        context.handleSelectionChange(
          message.TOKEN_PARAM_FIELD_ID,
          message.TOKEN_PARAM_FIELD_CHECKED
        );
        break;
      case Strings.TOKEN_CMD_ERROR:
        context.handleError(
          message.TOKEN_PARAM_ERROR_CONTEXT,
          parseInt(message.TOKEN_PARAM_RETURN_CODE),
          message.TOKEN_PARAM_ERROR_DESCRIPTION
        );
        break;
      default:
        return null;
    }
    return "found";
  };
})(STPadServerLibDefault);
