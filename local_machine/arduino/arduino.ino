int motorConfig[3][4] = {{10,11,12,13}, {6,7,8,9}, {5,4,3,2}};
int motorState[3] = {0, 0, 0};
int button[3] = {22, 24, 26};
float shelfD=10.5;
float raiseD=1;
float stCm = 1630.4;

float xshelfD=11;
float xstCm = 19.98;

int dt = 2;
int dn = 10;

int fz=0;
int tz=0;
int fx=0;
int tx=0;

void setPins(){
 for(int i=0;i<3;i++){
  for(int j=0;j<4;j++){
      pinMode(motorConfig[i][j],OUTPUT);
    }
  }  
}
void StopMotor(int motor){
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     
}
///Stepper motor control//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void StepMotor(int motor, bool direction) {
  int state = motorState[motor];
  if(direction==true){
    state++;
    if(state>3){state=0;}
  }
  else {
    state--;
    if(state<0){state=3;}
  }
  motorState[motor] = state;
  if(state==0){
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][1], HIGH);
     
    }
    if(state==1){
     digitalWrite(motorConfig[motor][3], LOW);
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
   
    }
    if(state==2){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
    }
    if(state==3){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], HIGH);
     
     digitalWrite(motorConfig[motor][0], HIGH);
    }
}

void NemaMotor(int motor, bool direction) {
  int state = motorState[motor];
  if(direction==true){
    state++;
    if(state>3){state=0;}
  }
  else {
    state--;
    if(state<0){state=3;}
  }
  motorState[motor] = state;
  if(state==0){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
    }
    if(state==1){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
   
    }
    if(state==2){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
    }
    if(state==3){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
     }
}

void NemaMotor2(int motor, bool direction) {
  int state = motorState[motor];
  if(direction==true){
    state++;
    if(state>7){state=0;}
  }
  else {
    state--;
    if(state<0){state=7;}
  }
  motorState[motor] = state;
  if(state==0){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
    }
  if(state==1){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
    }
    if(state==2){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
   
    }
    if(state==3){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][3], HIGH);
   
    }
    if(state==4){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
    }
    if(state==5){
     digitalWrite(motorConfig[motor][3], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
    }
    if(state==6){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
     }
    if(state==7){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][2], HIGH);
     }
}

//Stepper motor control///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  void G28(int m){
    while(true){
          StepMotor(m,false);
          delay(2);
          if(digitalRead(button[m])||Serial.read()=='h'){break;}
      }
   StopMotor(0);
   StopMotor(1);
   StopMotor(2);
   delay(500);
   }
   void G28_1(int m){
    /*int n = 600;
    int s = 4;
    int is = 40;
    int cs = is;
    int a = 2;
    int n2 = 470;
   
    for(int i = 0; i < n; i++){
          NemaMotor2(m,true);
          delay(cs);
          cs -= a;
          if(cs < s)cs = s;
          if(i > n2) {            
              cs += a;
            if(cs > is)cs = is;
          }
      }
      cs = is;
    for(int i = 0; i < n; i++){
          NemaMotor2(m,false);
          delay(cs);
          cs -= a;
          if(cs < s)cs = s;
          if(i > n2) {            
              cs += a;
            if(cs > is)cs = is;
          }
      }*/
    while(true){
          NemaMotor2(m,false);
          delay(5);
          if(digitalRead(button[m])||Serial.read()=='h'){break;}
      }
      delay(1000);
      int i=0;
   while(i<15){
          NemaMotor2(m,true);
          delay(25);
      i++;
      } 
   StopMotor(0);
   StopMotor(1);
   StopMotor(2);
   delay(500);
   }
void setup() {
  pinMode(button[0],INPUT);
  pinMode(button[1],INPUT);
  pinMode(button[2],INPUT);
  
  pinMode(30,OUTPUT);
  pinMode(31,OUTPUT);
  
  pinMode(32,OUTPUT);
  pinMode(33,OUTPUT);
  
  pinMode(34,OUTPUT);
  pinMode(35,OUTPUT);

  
  
  digitalWrite(30,HIGH);
  digitalWrite(31,LOW);

  digitalWrite(32,HIGH);
  digitalWrite(33,LOW);

  digitalWrite(34,HIGH);
  digitalWrite(35,LOW);
  
  Serial.begin(9600);

  setPins();
}

void ymotor(bool dir){
  for(int i=0;i<2038*4.4;i++){
          StepMotor(0,dir );
          delay(2);
      }
      StopMotor(0);
}
void Zmotor(bool dir,float shelf){
  for(int i=0;i<stCm*shelfD*shelf;i++){
            StepMotor(1,dir );
          delay(2);
      }
      StopMotor(1);
}
void Xmotor(bool dir,float shelf){
  for(int i=0;i<xstCm*xshelfD*shelf;i++){
            NemaMotor2(2,dir);
          delay(dn);
      }
      StopMotor(2);
}

void Zraise(bool dir){
  for(int i=0;i<stCm*raiseD;i++){
          StepMotor(1,dir );
          delay(2);
      }
      StopMotor(1);
}
void Pos(int from,int zPos){
        if(zPos<from){Serial.println("POS 1");Zmotor(true,from-zPos);}
        if(zPos>from){Serial.println("POS 2");Zmotor(false,zPos-from);}
}
void Posx(int from,int xPos){
        if(xPos<from){Serial.println("POS 3");Xmotor(true,from-xPos);}
        if(xPos>from){Serial.println("POS 4");Xmotor(false,xPos-from);}
}
//State  kyde e
int zPos = 0;
int xPos = 0;
int command;
//Console 0 2

void loop() {
  //Read from to
  ////////////////////////////////////////////////////////
  while(true) {
    command=Serial.read();
    if(command == -1) continue;
   
    if(command=='r'||command=='m'||command=='p'||command=='g'||command=='c'){
      break;
      }
     else if(command== ' ' ||command== '\n' ||command== '\r' ||command== '\t'){}
          else{Serial.println("error \n");}
    }      
  if(command=='c'){Serial.print("c");}
  else if(command=='r'){Serial.print("Y:");G28(0);Serial.print("Z:");G28(1);Serial.print("X:");G28_1(2);Serial.println("r");/*Serial.println("\n");*/}
  else if(command=='m'){
            Serial.print("FROMX :");
             while(true) {
              fx=Serial.read();
              if((fx >= '0') && (fx <= '4')) {
                fx -= '0';
                break;
              }
            }
            Serial.println(fx);
            Serial.print("FROMZ :");
            while(true) {
              fz=Serial.read();
              if((fz >= '0') && (fz <= '4')) {
                fz -= '0';
                break;
              }
            }            
            Serial.println(fz);
           Serial.print("TOX :");
            while(true) {
              tx=Serial.read();
              if((tx >= '0') && (tx <= '4')) {
                tx -= '0';
                break;
              }
            }            
            Serial.println(tx);
            Serial.print("TOZ :");
            while(true) {
              tz=Serial.read();
              if((tz >= '0') && (tz <= '4')) {
                tz -= '0';
                break;
              }
            }            
            Serial.println(tz);
           
            //////////////////////////////////////////////////////
           
                StopMotor(0);
                StopMotor(1);
                StopMotor(2);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
              Posx(fx,xPos);
                         

///////////////////////////////////////////////////////////////////////////////////////////////////                
             Pos(fz,zPos);
             if(fz<=tz){
                ymotor(true);
                Zraise(true);
                ymotor(false);
          /// ////////////////////////
             if(fx<=tx){  
                Xmotor(true,tx-fx);
                xPos=tx;
             }
             if(fx>tx){  
                Xmotor(false,fx-tx);
                xPos=tx;
             }  
          ////////////////////////////
                Zmotor(true,tz-fz);
                ymotor(true);
                Zraise(false);
                ymotor(false);
                zPos=tz;
             }

             
             if(fz>tz){
                ymotor(true);
                Zraise(true);
                ymotor(false);
          /// ////////////////////////
             if(fx<=tx){  
                Xmotor(true,tx-fx);
                xPos=tx;
             }
             if(fx>tx){  
                Xmotor(false,fx-tx);
                xPos=tx;
             }  
          /// ////////////////////////
                Zmotor(false,fz-tz);
                ymotor(true);
                Zraise(false);
                ymotor(false);
                zPos=tz;
             }
             
                Serial.println("r");
                //Serial.println("\n");
        }
else if(command=='p'){
        Serial.print("Z :");
        Serial.println(zPos);
        Serial.print("X :");
        Serial.println(xPos);
       // Serial.println("\n");
  }        
else if(command=='g'){
        int X;
        while(true) {
              X=Serial.read();
              if((X >= '0') && (X <= '3')) {
                X -= '0';
                break;
              }
            }  
          int Z;
        while(true) {
              Z=Serial.read();
              if((Z >= '0') && (Z <= '2')) {
                Z -= '0';
                break;
              }
            }

        Pos(Z,zPos);
        zPos=Z;
        Posx(X,xPos);
        xPos=X;
        Serial.print("r");
       // Serial.println("\n");
  }
      delay(2000);
}
/*int motorConfig[3][4] = {{10,11,12,13}, {6,7,8,9}, {5,4,3,2}};
int motorState[3] = {0, 0, 0};
int button[3] = {22, 23, 24};
float shelfD=4;
float raiseD=1.5;
float stCm = 1630.4;

float xshelfD=4;
float xstCm = 62.5;

int dt = 2;
int dn = 10;
3
int fz=0;
int tz=0;
int fx=0;
int tx=0;

void setPins(){
 for(int i=0;i<3;i++){
  for(int j=0;j<4;j++){
      pinMode(motorConfig[i][j],OUTPUT);
    }
  }  
}
void StopMotor(int motor){
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     
}
///Stepper motor control//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void StepMotor(int motor, bool direction) {
  int state = motorState[motor];
  if(direction==true){
    state++;
    if(state>3){state=0;}
  }
  else {
    state--;
    if(state<0){state=3;}
  }
  motorState[motor] = state;
  if(state==0){
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][1], HIGH);
     
    }
    if(state==1){
     digitalWrite(motorConfig[motor][3], LOW);
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
   
    }
    if(state==2){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
    }
    if(state==3){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     digitalWrite(motorConfig[motor][3], HIGH);
     
     digitalWrite(motorConfig[motor][0], HIGH);
    }
}

void NemaMotor(int motor, bool direction) {
  int state = motorState[motor];
  if(direction==true){
    state++;
    if(state>3){state=0;}
  }
  else {
    state--;
    if(state<0){state=3;}
  }
  motorState[motor] = state;
  if(state==0){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
    }
    if(state==1){
     digitalWrite(motorConfig[motor][0], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][1], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
   
    }
    if(state==2){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][2], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][3], HIGH);
    }
    if(state==3){
     digitalWrite(motorConfig[motor][1], LOW);
     digitalWrite(motorConfig[motor][3], LOW);
     
     digitalWrite(motorConfig[motor][0], HIGH);
     digitalWrite(motorConfig[motor][2], HIGH);
     }
}
//Stepper motor control///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  void G28(int m){
    while(true){
          StepMotor(m,false);
          delay(2);
          if(digitalRead(button[m])==1||Serial.read()=='h'){break;}
      }
   StopMotor(0);
   StopMotor(1);
   StopMotor(2);
   delay(500);
   }
   void G28_1(int m){
    while(true){
          NemaMotor(m,false);
          delay(20);
          if(/*digitalRead(button[m])==1||Serial.read()=='h'){break;}
      }
   StopMotor(0);
   StopMotor(1);
   StopMotor(2);
   delay(500);
   }
void setup() {
  pinMode(button[0],INPUT);
  pinMode(button[1],INPUT);
  pinMode(button[2],INPUT);
  Serial.begin(9600);
  setPins();
}
void ymotor(bool dir){
  for(int i=0;i<2038*4.4;i++){
          StepMotor(0,dir );
          delay(2);
      }
      StopMotor(0);
}
void Zmotor(bool dir,float shelf){
  for(int i=0;i<stCm*shelfD*shelf;i++){
            StepMotor(1,dir );
          delay(2);
      }
      StopMotor(1);
}
void Xmotor(bool dir,float shelf){
  for(int i=0;i<xstCm*xshelfD*shelf;i++){
            NemaMotor(2,dir);
          delay(dn);
      }
      StopMotor(2);
}

void Zraise(bool dir){
  for(int i=0;i<stCm*raiseD;i++){
          StepMotor(1,dir );
          delay(2);
      }
      StopMotor(1);
}
void Pos(int from,int zPos){
        if(zPos<from){Serial.println("Positioning 1");Zmotor(true,from-zPos);}
        if(zPos>from){Serial.println("Positioning 2");Zmotor(false,zPos-from);}
}
void Posx(int from,int xPos){
        if(xPos<from){Serial.println("Positioning 3");Xmotor(true,from-xPos);}
        if(xPos>from){Serial.println("Positioning 4");Xmotor(false,xPos-from);}
}
//State  kyde e
int zPos = 0;
int xPos = 0;
int command;
//Console 0 2

void loop() {
  //Read from to
  ////////////////////////////////////////////////////////
  while(true) {
    command=Serial.read();
    if(command == -1) continue;
   
    if(command=='r'||command=='m'||command=='p'||command=='g'||command=='g'){
      break;
      }
     else if(command== ' ' ||command== '\n' ||command== '\r' ||command== '\t'){}
          else{Serial.println("error \n");}
    }      

  if(command=='r'){Serial.print("Y Homing :");G28(0);Serial.println("Y Ready");Serial.print("Z Homing :");G28(1);Serial.println("Z Ready");Serial.print("X Homing :");G28_1(2);Serial.println("X Ready");Serial.println("\n");}
  else if(command=='m'){
            Serial.print("fromX :");
             while(true) {
              fx=Serial.read();
              if((fx >= '0') && (fx <= '4')) {
                fx -= '0';
                break;
              }
            }
            Serial.println(fx);
            Serial.print("fromZ :");
            while(true) {
              fz=Serial.read();
              if((fz >= '0') && (fz <= '4')) {
                fz -= '0';
                break;
              }
            }            
            Serial.println(fz);
           Serial.print("toX :");
            while(true) {
              tx=Serial.read();
              if((tx >= '0') && (tx <= '4')) {
                tx -= '0';
                break;
              }
            }            
            Serial.println(tx);
            Serial.print("toZ :");
            while(true) {
              tz=Serial.read();
              if((tz >= '0') && (tz <= '4')) {
                tz -= '0';
                break;
              }
            }            
            Serial.println(tz);
           
            //////////////////////////////////////////////////////
           
                StopMotor(0);
                StopMotor(1);
                StopMotor(2);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
              Posx(fx,xPos);
                         

///////////////////////////////////////////////////////////////////////////////////////////////////                
             Pos(fz,zPos);
             if(fz<=tz){
                ymotor(true);
                Zraise(true);
                ymotor(false);
          /// ////////////////////////
             if(fx<=tx){  
                Xmotor(true,tx-fx);
                xPos=tx;
             }
             if(fx>tx){  
                Xmotor(false,fx-tx);
                xPos=tx;
             }  
          ////////////////////////////
                Zmotor(true,tz-fz);
                ymotor(true);
                Zraise(false);
                ymotor(false);
                zPos=tz;
             }

             
             if(fz>tz){
                ymotor(true);
                Zraise(true);
                ymotor(false);
          /// ////////////////////////
             if(fx<=tx){  
                Xmotor(true,tx-fx);
                xPos=tx;
             }
             if(fx>tx){  
                Xmotor(false,fx-tx);
                xPos=tx;
             }  
          /// ////////////////////////
                Zmotor(false,fz-tz);
                ymotor(true);
                Zraise(false);
                ymotor(false);
                zPos=tz;
             }
             
                Serial.println("r");
                Serial.println("\n");
        }
else if(command=='p'){
        Serial.print("Z :");
        Serial.println(zPos);
        Serial.print("X :");
        Serial.println(xPos);
        Serial.println("\n");
  }        
else if(command=='g'){
        int Z;
        while(true) {
              Z=Serial.read();
              if((Z >= '0') && (Z <= '4')) {
                Z -= '0';
                break;
              }
            }
        int X;
        while(true) {
              X=Serial.read();
              if((X >= '0') && (X <= '9')) {
                X -= '0';
                break;
              }
            }  
        Pos(Z,zPos);
        zPos=Z;
        Posx(X,xPos);
        xPos=X;
        Serial.print("r");
        Serial.println("\n");
  }
      delay(2000);
}

*/
