(function(b){var a=/^\d{17}(\d|x)$/i,c={"11":1,"12":1,"13":1,"14":1,"15":1,"21":1,"22":1,"23":1,"31":1,"32":1,"33":1,"34":1,"35":1,"36":1,"37":1,"41":1,"42":1,"43":1,"44":1,"45":1,"46":1,"50":1,"51":1,"52":1,"53":1,"54":1,"61":1,"62":1,"63":1,"64":1,"65":1,"71":1,"81":1,"82":1,"91":1};function d(j){var h=0,e="",g,k;if(j.length==15){e=j.substr(0,6)+"19"+j.substr(6,9)+"0"}else{if(j.length==18){e=j}else{return false}}if(!a.test(e)){return false}e=e.replace(/x$/i,"a");if(!c[e.substr(0,2)]){return false}g=e.substr(6,4)+"/"+Number(e.substr(10,2))+"/"+Number(e.substr(12,2));k=new Date(g);if(g!==(k.getFullYear()+"/"+(k.getMonth()+1)+"/"+k.getDate())){return false}if(j.length==18){for(var f=17;f>=0;f--){h+=(Math.pow(2,f)%11)*parseInt(e.charAt(17-f),11)}if(h%11!=1){return false}}return true}b.isIdCard=d})(this);