# AWS 기술을 활용한 주차 관리 시스템
<br/>

### 💡 프로젝트 소개
1. 차량의 번호판이 찍힐 수 있는 최소거리를 미리 설정하여 초음파 센서를 이용하여 다가오는 차량 감지
2. 차량이 감지되면 라즈베리파이 카메라 모듈을 이용하여 차량의 번호판을 촬영하고 이미지를 S3 버킷에 업로드
3. AWS Rekognition을 사용하여 촬영된 번호판 이미지의 텍스트 추출 -> 추출된 텍스트를 비교하여 같은 번호가 존재하면 출차, 없으면 입차 처리
<br/>


### 💡 작품 구성도
<img width="600" alt="image" src="https://user-images.githubusercontent.com/66028419/178174859-88358f5a-4c7f-46c0-88bd-09137618fcdb.png">


-	**camera.js** : 차량의 번호판이 찍힐 수 있는 최소 거리를 미리 설정, 초음파 센서를 이용하여 차량이 감지되었을 때 카메라 모듈을 이용하여 차량의 번호판을 촬영하고 S3에 이미지 업로드 후 ‘carRecog/request’ 토픽으로 publish
-	**index.js** : ‘carRecog/request’ 토픽으로 메시지가 들어오면 람다 함수 호출되어 rekognition 실행 후 ‘carRecog/detect/car’ 토픽으로 publish
-	**manage.js** : ‘carRecog/detect/car’ 토픽을 subscribe 하고 있다가 메시지가 들어오면 차량 번호와 데이터베이스 비교 후 입차, 출차 처리
<br/>


### 💡 사용된 부품 
- 라즈베리 파이 3 Model B, 초음파 센서(HC-SR04), 카메라 모듈(Camera V2.1)
<br/>

### 💡 사용된 기술 
- AWS IoT Core
- AWS Rule
- AWS IAM
- AWS Lambda
- AWS S3
- AWS Rekognition
<br/>

### 💡 결과 Screenshots
camera.js  
<img width="452" alt="image" src="https://user-images.githubusercontent.com/66028419/178176396-5baeae18-c9a6-410d-9ea6-b3a153d7d846.png">  
manage.js  
<img width="452" alt="image" src="https://user-images.githubusercontent.com/66028419/178176410-636f2512-299d-4ec8-a562-96e549a4db12.png">
<br/>


