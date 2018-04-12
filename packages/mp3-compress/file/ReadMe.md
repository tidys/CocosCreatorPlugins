
* 确保你已经安装了lame解码器 https://jaist.dl.sourceforge.net/project/lame/lame/3.99/lame-3.99.5.tar.gz 或者../_install下面有完整包

> 安装方法
  Run the following commands:

  % ./configure
  % make
  % make install
  测试：lame，如果有版本号输出说明安装正确。

* 执行 node toMp3Andcompress.js {dir} ，这样{dir}下面的所有wav格式音频都会被转成mp3格式并被压缩一次，可以根据自己需求修改脚本