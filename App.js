import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable, //새로나온것 기능많음
  Keyboard,
} from "react-native";
import { theme } from "./colors";
import { Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DismissKeyboard from "./DismissKeyboard";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [check, setCheck] = useState(false);
  const [editing, setediting] = useState(false);

  useEffect(() => {
    loadToDos(); //Reload되면 함수호출
  }, []);

  useEffect(() => {}, [toDos]);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);

  const onEditChangeText = (payload) => {
    setToDos({
      ...toDos,
      [payload.key]: { ...toDos[payload.key], text: payload.text },
    });
  };

  // <데이터 저장하기>
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      // AsyncStorage - 문자열데이터만 저장가능. 객체 직렬화stringify하기
      // JSON.stringify(toSave) : 현재 todos를 string으로 변경함
      //("@key이름", value) :key, value 다 ""string이어야 함, await해야함
    } catch (error) {
      console.log(error);
    }
  };

  // <데이터 불러오기>
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s));
        //parse: string을 js obj로 변경
      }
    } catch (error) {
      console.log(error);
    }
  };

  // <추가하기>
  const addToDo = async () => {
    if (text === "") {
      //input창 비어있으면 아무것도 안하기
      return;
    }
    // obj결합 방법2. ES6문법 const Newobj = {...기존obj, 새로운obj}
    const newToDos = {
      ...toDos, //기존의 obj 내용 전부
      [Date.now()]: { text, working, check, editing }, // 새로운 obj 생성
    };
    // // obj결합 방법1. Object.assign({}결합될 obj, 이전object, 새object);
    // const newToDos = ({}, toDos, { [Date.now()]: { text, working } });
    setToDos(newToDos); //새로쓴todo 넣기
    await saveToDos(newToDos); //새로운todo를 저장하기/ AsyncStorage여서 await해야함
    setText(""); //전송하면 input창 비우기
  };

  // <삭제하기>
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" }, //취소
        {
          text: "Sure", //확인
          style: "destructive", //버튼색상 구분 .ios만 가능
          onPress: () => {
            const newToDos = { ...toDos }; // 기존obj내용복사해서 생성
            delete newToDos[key]; //그 obj안에 key만 삭제
            setToDos(newToDos); //새로쓴todo 넣기/ 업데이트
            saveToDos(newToDos); //새로운todo를 저장
          },
        },
      ]);
    }
    return;
  };

  // <check하기>
  const checkToDo = (key) => {
    let newToDos = { ...toDos }; // 기존obj내용복사해서 생성
    if (newToDos[key].check) {
      newToDos[key].check = false;
    } else {
      newToDos[key].check = true;
    }
    setToDos(newToDos); //새로쓴todo 넣기/ 업데이트
    saveToDos(newToDos); //새로운todo를 저장
  };

  // <수정하기>
  const editToDo = (key) => {
    let newToDos = { ...toDos }; // 기존obj내용복사해서 생성
    if (toDos[key].text === "") {
      newToDos[key].editing = false;
    }
    newToDos[key].editing = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  // <수정끝>
  const editDone = async (key) => {
    if (!toDos[key].text === "") {
      return;
    }

    const newToDos = { ...toDos };
    newToDos[key].editing = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      {/* <DismissKeyboard> */}
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? "white" : theme.isworking,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: !working ? "white" : theme.isworking,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo} //제출버튼누를때 실행
        onChangeText={onChangeText} //글자변경 감지
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
        // multiline //여러줄 사용가능
        // secureTextEntry //비번쓸때 사용 ***이렇게보이는 것
        // autoCapitalize={"sentences"} //시작할떄 소문자
        // keyboardType="" //이메일, 번호 입력자판 넣을때
      />
      {/* </DismissKeyboard> */}

      <ScrollView>
        {/* <Work -  Travel 에 따른 todo보여주기>
        Object.keys는 key값만 담긴 배열ary 반환함. ary여서 map사용가능
        <toDos의 key값 접근해서 working값:저장된값>이 <state의 working값:클릭할때 변경된값>과 동일한지 체크 */}
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <TouchableOpacity onPress={() => checkToDo(key)}>
                <Ionicons
                  name={
                    toDos[key].check
                      ? "md-checkmark-circle"
                      : "md-checkmark-circle-outline"
                  }
                  size={30}
                  color={toDos[key].check ? theme.icons : theme.ischeck}
                />
              </TouchableOpacity>
              <View style={styles.textBox}>
                {toDos[key].editing ? (
                  <TextInput
                    onSubmitEditing={() => editDone(key)}
                    style={{ ...styles.textBox, ...styles.toDoText }}
                    value={toDos[key].text}
                    onChangeText={(text) => onEditChangeText({ key, text })}
                    returnKeyType="done"
                    autoFocus={true}
                    autoCapitalize="none"
                    clearTextOnFocus={true}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      marginRight: 10,
                      color: toDos[key].check ? theme.underline : theme.icons,
                      textDecorationLine: toDos[key].check
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
                {toDos[key].editing ? null : (
                  <TouchableOpacity
                    style={{ ...styles.icons, marginRight: 10 }}
                    onPress={() => editToDo(key)}
                  >
                    <MaterialCommunityIcons
                      name="lead-pencil"
                      size={24}
                      color={theme.icons}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{ ...styles.icons }}
                  onPress={() => deleteToDo(key)}
                >
                  <Fontisto name="trash" size={18} color={theme.icons} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20, //가로방향 패딩
    // paddingHorizontal - css에 없는 속성
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  textBox: {
    color: theme.icons,
    backgroundColor: theme.toDoBg,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  toDoText: {
    flex: 2,
    // marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  icons: {
    marginRight: 10,
    justifyContent: "flex-start",
  },
});
