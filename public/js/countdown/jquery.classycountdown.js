/*!
 * jQuery ClassyCountdown
 * www.class.pm
 *
 * Written by Marius Stanciu - Sergiu <marius@class.pm>
 * Licensed under the MIT license www.class.pm/LICENSE-MIT
 * Version 1.0.0
 *
 */

(function($) {
    $.fn.ClassyCountdown = function(options, callback) {
        var element = $(this);
        var DaysLeft, HoursLeft, MinutesLeft, SecondsLeft;
        var secondsLeft;
        var isFired = false;
        var settings = {
            end: undefined,
            now: $.now(),
            labels: true,
            labelsOptions: {
                lang: {
                    seconds: 'Seconds'
                },
                style: 'font-size: 0.5em;'
            },
            style: {
                element: '',
                labels: false,
                textResponsive: 0.5,
                seconds: {
                    gauge: {
                        thickness: 0.02,
                        bgColor: 'rgba(0, 0, 0, 0)',
                        fgColor: 'rgba(0, 0, 0, 1)',
                        lineCap: 'butt'
                    },
                    textCSS: ''
                }
            },
            onEndCallback: function() {
            }
        };
        if (options.theme) {
            settings = $.extend(true, settings, getPreset(options.theme));
        }
        settings = $.extend(true, settings, options);
        prepare();
        doTick();
        setInterval(doTick, 1000);
        doResponsive();
        
        function prepare() {
            element.append('<div class="ClassyCountdown-wrapper">' +
                    '<div class="ClassyCountdown-seconds">' +
                        '<input type="text" />' +
                        '<span class="ClassyCountdown-value"><div></div><span></span></span>' +
                    '</div>' +
                '</div>');
            element.find('.ClassyCountdown-seconds input').knob($.extend({
                width: '100%',
                displayInput: false,
                readOnly: true,
                max: 60
            }, settings.style.seconds.gauge));
            element.find('.ClassyCountdown-wrapper > div').attr("style", settings.style.element);
            element.find('.ClassyCountdown-seconds .ClassyCountdown-value').attr('style', settings.style.seconds.textCSS);
            element.find('.ClassyCountdown-value').each(function() {
                $(this).css('margin-top', Math.floor(0 - (parseInt($(this).height()) / 2)) + 'px');
            });
            if (settings.labels) {
                element.find(".ClassyCountdown-seconds .ClassyCountdown-value > span").html(settings.labelsOptions.lang.seconds);
                element.find(".ClassyCountdown-value > span").attr("style", settings.labelsOptions.style);
            }
            secondsLeft = settings.end - settings.now;
            secondsToDHMS();
        }
        
        function secondsToDHMS() {
            SecondsLeft = Math.floor((((secondsLeft % 86400) % 3600) % 60) % 60);
        }

        function doTick() {
            secondsLeft--;
            secondsToDHMS();
            if (secondsLeft <= 0) {
                if (!isFired) {
                    isFired = true;
                    settings.onEndCallback();
                }
                SecondsLeft = 0;
            }
            element.find('.ClassyCountdown-seconds input').val(60 - SecondsLeft).trigger('change');
            element.find('.ClassyCountdown-seconds .ClassyCountdown-value > div').html(SecondsLeft);
        }
        
        function doResponsive() {
            element.find('.ClassyCountdown-wrapper > div').each(function() {
                $(this).css('height', $(this).width() + 'px');
            });
            if (settings.style.textResponsive) {
                element.find('.ClassyCountdown-value').css('font-size', Math.floor(element.find('> div').eq(0).width() * settings.style.textResponsive / 10) + 'px');
                element.find('.ClassyCountdown-value').each(function() {
                    $(this).css('margin-top', Math.floor(0 - (parseInt($(this).height()) / 2)) + 'px');
                });
            }
            $(window).trigger('resize');
            $(window).resize($.throttle(50, onResize));
        }

        function onResize() {
            element.find('.ClassyCountdown-wrapper > div').each(function() {
                $(this).css('height', $(this).width() + 'px');
            });
            if (settings.style.textResponsive) {
                element.find('.ClassyCountdown-value').css('font-size', Math.floor(element.find('> div').eq(0).width() * settings.style.textResponsive / 10) + 'px');
            }
            element.find('.ClassyCountdown-value').each(function() {
                $(this).css("margin-top", Math.floor(0 - (parseInt($(this).height()) / 2)) + 'px');
            });
            element.find('.ClassyCountdown-seconds input').trigger('change');
        }
        
        function getPreset(theme) {
            switch (theme) {
                case 'flat-colors':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.01,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#f39c12"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'flat-colors-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.03,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#f39c12"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'flat-colors-very-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.12,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#f39c12"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'flat-colors-black':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.25,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#f39c12",
                                    lineCap: 'round'
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'black':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.01,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#222"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'black-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.03,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#222"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'black-very-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.17,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#222"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'black-black':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.25,
                                    bgColor: "rgba(0,0,0,0.05)",
                                    fgColor: "#222",
                                    lineCap: 'round'
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#34495e;'
                            }
                        }
                    };
                case 'white':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.03,
                                    bgColor: "rgba(255,255,255,0.05)",
                                    fgColor: "#fff"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#fff;'
                            }
                        }
                    };
                case 'white-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.06,
                                    bgColor: "rgba(255,255,255,0.05)",
                                    fgColor: "#fff"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#fff;'
                            }
                        }
                    };
                case 'white-very-wide':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.16,
                                    bgColor: "rgba(255,255,255,0.05)",
                                    fgColor: "#fff"
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#fff;'
                            }
                        }
                    };
                case 'white-black':
                    return {
                        labels: true,
                        style: {
                            element: '',
                            textResponsive: 0.5,
                            seconds: {
                                gauge: {
                                    thickness: 0.25,
                                    bgColor: "rgba(255,255,255,0.05)",
                                    fgColor: "#fff",
                                    lineCap: 'round'
                                },
                                textCSS: 'font-family:\'Open Sans\';font-weight:300;color:#fff;'
                            }
                        }
                    };
            }
        }
    };
})(jQuery);