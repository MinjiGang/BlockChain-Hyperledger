# BlockChain-Hyperledger
# Hyperledger Fabric 기본 실습 튜토리얼

## 프로젝트 개요

이 실습은 Hyperledger Fabric 기반 블록체인 네트워크를 실행하고,
체인코드(스마트 계약)를 배포한 뒤,
데이터를 저장하고 조회하는 기본 과정을 다룬다.

이후 확장 단계에서는 SHA-256 해시를 이용한 데이터 무결성 검증 시스템 구현으로 이어질 수 있다.

---

# 실습 목표

실습을 통해 다음을 수행한다.

* Fabric 네트워크 실행
* Channel 생성
* Chaincode 배포
* Asset 저장(CreateAsset)
* Asset 조회(ReadAsset)
* Endorsement 정책 이해
* Docker 기반 체인코드 빌드 구조 이해

---

# 실습 환경

## 사용 환경

* WSL Ubuntu
* Docker Desktop
* Hyperledger Fabric Samples
* Go

---

# 1. Fabric Samples 준비

먼저 fabric-samples가 준비되어 있어야 한다.

```bash
cd ~
git clone https://github.com/hyperledger/fabric-samples.git
```

---

# 2. test-network 이동

```bash
cd ~/fabric-samples/test-network
```

확인:

```bash
ls
```

다음 파일이 보여야 한다.

```plaintext
network.sh
```

---

# 3. Fabric Binary 설치

## 실행

```bash
./network.sh prereq
```

---

## 필요한 이유

Fabric CLI 명령어인:

```plaintext
peer
configtxgen
cryptogen
```

등이 설치된다.

설치되지 않으면:

```plaintext
peer: command not found
```

오류가 발생한다.

---

# 4. 네트워크 실행

```bash
./network.sh up createChannel
```

---

## 수행되는 작업

* peer 생성
* orderer 생성
* channel 생성
* docker container 실행

---

## 확인

```bash
docker ps
```

다음 컨테이너들이 보여야 한다.

```plaintext
peer0.org1.example.com
peer0.org2.example.com
orderer.example.com
```

---

# 5. Go 설치

## 설치

```bash
sudo apt update
sudo apt install golang-go -y
```

확인:

```bash
go version
```

---

## 왜 Go가 필요한가?

Hyperledger Fabric 자체와 체인코드 언어는 다르다.

Fabric은 블록체인 플랫폼이고,
체인코드는 Go/JavaScript/TypeScript 등으로 작성된다.

이번 실습에서는:

```plaintext
chaincode-go
```

를 사용하기 때문에 Go 컴파일러가 필요하다.

---

## Go 미설치 시 발생한 오류

```plaintext
Error: failed to read chaincode package at 'basic.tar.gz'
```

원인:

```plaintext
Go 체인코드 빌드 실패
→ chaincode package 생성 실패
```

해결:

```bash
go mod tidy
```

및 Go 설치.

---

# 6. Docker 이미지 다운로드 문제

체인코드 배포 시 다음 오류가 발생할 수 있다.

```plaintext
No such image: hyperledger/fabric-ccenv:3.1
```

---

## 원인

Fabric이 Go 체인코드를 Docker 안에서 빌드하려고 했지만,
필요한 Docker 이미지가 존재하지 않음.

---

## 해결

```bash
docker pull hyperledger/fabric-ccenv:3.1
```

또는:

```bash
./network.sh prereq
```

---

# 7. 체인코드 배포

## 실행

```bash
./network.sh deployCC \
-ccn basic \
-ccl go \
-ccp ../asset-transfer-basic/chaincode-go \
-ccv 1.0
```

---

# 옵션 설명

| 옵션         | 의미       |
| ---------- | -------- |
| -ccn basic | 체인코드 이름  |
| -ccl go    | Go 언어 사용 |
| -ccp       | 체인코드 위치  |
| -ccv 1.0   | 체인코드 버전  |

---

# 실습 중 발생한 오류들

## 오류 1

```plaintext
Unknown flag: basic-ccp
```

### 원인

줄바꿈 시 `\` 앞 공백 누락.

잘못된 예:

```bash
-ccl go\
-ccl basic\
```

---

### 해결

```bash
-ccl go \
-ccn basic \
```

---

## 오류 2

```plaintext
Unknown flag: -cv
```

### 원인

Fabric 버전에 따라 옵션명이 다름.

---

### 해결

```bash
-ccv 1.0
```

사용.

---

# 8. peer CLI 환경 변수 설정

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

---

## 필요한 이유

peer CLI에게:

```plaintext
현재 Org1 관리자 권한으로 동작 중
```

임을 알려준다.

설정하지 않으면:

```plaintext
peer command not found
```

또는

```plaintext
접속 실패
```

문제가 발생할 수 있다.

---

# 9. 체인코드 배포 확인

```bash
peer lifecycle chaincode querycommitted -C mychannel
```

정상 예:

```plaintext
Name: basic, Version: 1.0
```

---

# 10. Asset 저장

## 실행

```bash
peer chaincode invoke \
-o localhost:7050 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C mychannel \
-n basic \
--peerAddresses localhost:7051 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
--waitForEvent \
-c '{"function":"CreateAsset","Args":["asset10","blue","5","Tom","100"]}'
```

---

# 저장 데이터 의미

| 값       | 의미  |
| ------- | --- |
| asset10 | ID  |
| blue    | 색상  |
| 5       | 크기  |
| Tom     | 소유자 |
| 100     | 가치  |

---

# 11. Asset 조회

```bash
peer chaincode query \
-C mychannel \
-n basic \
-c '{"Args":["ReadAsset","asset10"]}'
```

---

# 정상 결과 예시

```json
{
  "ID":"asset10",
  "color":"blue",
  "size":5,
  "owner":"Tom",
  "appraisedValue":100
}
```

---

# 실습 중 발생한 핵심 오류

## 오류

```plaintext
ENDORSEMENT_POLICY_FAILURE
```

---

## 원인

기본 endorsement policy는:

```plaintext
Org1 + Org2 모두 승인 필요
```

인데,
invoke 명령에서 Org1 peer만 사용함.

따라서 트랜잭션이 최종적으로 invalid 처리됨.

---

## 해결

invoke 시:

```plaintext
peer0.org1
peer0.org2
```

둘 다 추가.

---

# query 와 invoke 차이

| 명령     | 역할    |
| ------ | ----- |
| query  | 조회    |
| invoke | 저장/수정 |

query는 ledger를 변경하지 않는다.

실제 저장은 invoke로 수행한다.

---

# 실습 결과

이번 실습을 통해:

* Hyperledger Fabric 네트워크 실행
* Channel 생성
* Chaincode 배포
* Docker 기반 체인코드 빌드
* Asset 저장 및 조회
* Endorsement 정책 이해

를 수행하였다.

---

# 다음 단계

다음 단계에서는:

```plaintext
SHA-256 기반 데이터 무결성 검증
```

기능을 체인코드에 추가하여,
데이터 위변조 여부를 검증하는 시스템으로 확장할 수 있다.
