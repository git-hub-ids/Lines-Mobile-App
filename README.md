# Lines-Mobile-App

<h3>A React Native Mobile App for Libra Production</h3>

<h5>Project Enviroment</h3>
<ul>
<li>Node JS Version ~16.15.1</li> 
<li>YARN Version ~1.22.5</li> 
<li>EXPO Version ~4.0.17</li>  
</ul>

<h5>How to run this project</h5>
<ol>
<li>Open the porject folder in VS Code</li> 
<li>Run the following command to download the node modules using YARN:</li> 
<code>yarn</code>
<li>To run the project via EXPO:</li>
<code>expo start</code>
<li>To eject android & ios folders:</li>
<code>expo eject</code>
<li>Create a new folder named 'res' in the following path:</li>
<code>android/app/src/main</code>
<li>Run the following command</li>
<code>react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
<li>You can open the android folder in the Android Studio to build the APK</li>
<li>You can open the IOS folder in the XCode to build the IPA</li>
</ol>
