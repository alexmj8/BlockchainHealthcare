/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Grant EHR access to a clinician
 * @param {org.healthcare.com.GrantAccessToClinician} transaction
 * @transaction
 */

async function GrantAccessToClinician(transaction){

    var invokingParticipant = getCurrentParticipant();

    var authorizedCliniciansArr = [];
    invokingParticipant.authorizedClinicians = authorizedCliniciansArr;
    authorizedCliniciansArr.push(transaction.authorizedClinician);
    let pacientRegistry = await getParticipantRegistry('org.healthcare.com.Patient');
    await pacientRegistry.update(invokingParticipant);

    var patientsArr = [];
    transaction.authorizedClinician.patients = patientsArr;
    patientsArr.push(invokingParticipant);
    let clinicianRegistry = await getParticipantRegistry('org.healthcare.com.Clinician');
    await clinicianRegistry.update(transaction.authorizedClinician);
 }

 /**
 * Revoke EHR access from a clinician
 * @param {org.healthcare.com.RevokeAccessFromClinician} transaction
 * @transaction
 */
 async function RevokeAccessFromClinician(transaction){

    var invokingParticipant = getCurrentParticipant();

    var list = [];
    invokingParticipant.authorizedClinicians = list;
    var index = list.map(x => {
        return x.clinicianId;
      }).indexOf(transaction.unauthorizedClinician.clinicianId);

    list.splice(index, 1);
    let pacientRegistry = await getParticipantRegistry('org.healthcare.com.Patient');
    await pacientRegistry.update(invokingParticipant);

    var patientList = [];
    transaction.unauthorizedClinician.patients = patientList;
    var index = patientList.map(x => {
        return x.patientId;
      }).indexOf(invokingParticipant.patientId);

    patientList.splice(index, 1);
    let clinicianRegistry = await getParticipantRegistry('org.healthcare.com.Clinician');
    await clinicianRegistry.update(transaction.unauthorizedClinician);
 }

 /**
 * Grant EHR access to a lab
 * @param {org.healthcare.com.GrantAccessToLab} transaction
 * @transaction
 */

async function GrantAccessToLab(transaction){

    var invokingParticipant = getCurrentParticipant();

    var authorizedLabsArr = [];
    invokingParticipant.authorizedLabs = authorizedLabsArr;
    authorizedLabsArr.push(transaction.authorizedLab);
    let pacientRegistry = await getParticipantRegistry('org.healthcare.com.Patient');
    await pacientRegistry.update(invokingParticipant);

    var patientsArr = [];
    transaction.authorizedLab.patients = patientsArr;
    patientsArr.push(invokingParticipant);
    let labRegistry = await getParticipantRegistry('org.healthcare.com.Lab');
    await labRegistry.update(transaction.authorizedLab);
}

/**
 * Revoke EHR access from a lab
 * @param {org.healthcare.com.RevokeAccessFromLab} transaction
 * @transaction
 */
async function revokeAccessFromLab(transaction){

    var invokingParticipant = getCurrentParticipant();

    var list = [];
    invokingParticipant.authorizedLabs = list;
    var index = list.map(x => {
      return x.labId;
    }).indexOf(transaction.unauthorizedLab.labId);

    list.splice(index, 1);
    let pacientRegistry = await getParticipantRegistry('org.healthcare.com.Patient');
    await pacientRegistry.update(invokingParticipant);

    var patientList = [];
    transaction.unauthorizedLab.patients = patientList;
    var index = patientList.map(x => {
        return x.patientId;
    }).indexOf(invokingParticipant.patientId);

    patientList.splice(index, 1);
    let labRegistry = await getParticipantRegistry('org.healthcare.com.Lab');
    await labRegistry.update(transaction.unauthorizedLab);
}

/**
 * Grant wearable data access to a trainer
 * @param {org.healthcare.com.GrantAccessToTrainer} transaction
 * @transaction
 */

async function GrantAccessToTrainer(transaction){
  var invokingParticipant = getCurrentParticipant();
  var patientsArr = [];
  transaction.authorizedTrainer.patients = patientsArr;
  patientsArr.push(invokingParticipant);
  let trainerRegistry = await getParticipantRegistry('org.healthcare.com.PersonalTrainer');
  await trainerRegistry.update(transaction.authorizedTrainer);
}

/**
* Revoke wearable data access from a trainer
* @param {org.healthcare.com.RevokeAccessFromTrainer} transaction
* @transaction
*/
async function RevokeAccessFromTrainer(transaction){
  var invokingParticipant = getCurrentParticipant();
  var patientList = [];
  transaction.unauthorizedTrainer.patients = patientList;
  var index = patientList.map(x => {
      return x.patientId;
    }).indexOf(invokingParticipant.patientId);

  patientList.splice(index, 1);
  let trainerRegistry = await getParticipantRegistry('org.healthcare.com.PersonalTrainer');
  await trainerRegistry.update(transaction.unauthorizedTrainer);
}

/**
 * Create record Transaction
 * @param {org.healthcare.com.InitialMedicalRecord} recordData
 * @transaction
 */
async function InitialMedicalRecord(recordData) {
  var  factory = getFactory();
  var  namespace =  'org.healthcare.com';
  var  recordId = generateRecordId(32);
  var  medicalRecord = factory.newResource(namespace,'MedicalRecord',recordId);

  let patientRegistry = await getParticipantRegistry('org.healthcare.com.Patient');
  recordData.owner.medicalRecord = medicalRecord;
  await patientRegistry.update(recordData.owner);

  var invokingParticipant = getCurrentParticipant();

  // Get the Asset Registry
  return getAssetRegistry('org.healthcare.com.MedicalRecord')
      .then(function(medicalRecordRegistry){
          medicalRecord.medicalHistory = recordData.medicalHistory;
          medicalRecord.allergies = recordData.allergies;
          medicalRecord.currentMedication = recordData.currentMedication;
          medicalRecord.lastConsultationWith = invokingParticipant;
          medicalRecord.lastConsultationDate = recordData.lastConsultationDate;
          medicalRecord.activeHoursInAWeek = recordData.activeHoursInAWeek;
          medicalRecord.smoking = recordData.smoking;
          if(recordData.owner.getFullyQualifiedType() == 'org.healthcare.com.Patient'){
          medicalRecord.owner = recordData.owner;
          } else { throw new Error('Owner of the Medical Record must be a Patient.'); }
          medicalRecord.author = invokingParticipant;
          medicalRecord.version = 0;

          // Add to registry
          return medicalRecordRegistry.add(medicalRecord);
      });
}

/**
 * Create record Transaction
 * @param {org.healthcare.com.UpdateMedicalRecord} recordData
 * @transaction
 */
async function UpdateMedicalRecord(recordData){

  return getAssetRegistry('org.healthcare.com.MedicalRecord')
      .then(function(medicalRecordAssetRegistry) {
        var invokingParticipant = getCurrentParticipant();
        recordData.medicalRecord.medicalHistory = recordData.medicalHistory;
        recordData.medicalRecord.allergies = recordData.allergies;
        recordData.medicalRecord.currentMedication = recordData.currentMedication;
        recordData.medicalRecord.lastConsultationWith = recordData.medicalRecord.author;
        recordData.medicalRecord.lastConsultationDate = recordData.lastConsultationDate;
        recordData.medicalRecord.activeHoursInAWeek = recordData.activeHoursInAWeek;
        recordData.medicalRecord.smoking = recordData.smoking;
        recordData.medicalRecord.author = invokingParticipant;
        recordData.medicalRecord.version = recordData.medicalRecord.version + 1;

        return medicalRecordAssetRegistry.update(recordData.medicalRecord);
      });
}

/**
 * Create record Transaction
 * @param {org.healthcare.com.SendWearableData} wearableData
 * @transaction
 */
function SendWearableData(wearableData) {
  // Get the Asset Registry
  return getAssetRegistry('org.healthcare.com.WearableData')
      .then(function(wearableDataRegistry){
          var  factory = getFactory();
          var  namespace =  'org.healthcare.com';
          var  recordId = generateRecordId(32);
          var  wearableRecord = factory.newResource(namespace,'WearableData',recordId);

          wearableRecord.pedometer = wearableData.pedometer;
          wearableRecord.calories = wearableData.calories;
          wearableRecord.heartbeat = wearableData.heartbeat;
          wearableRecord.owner = wearableData.owner;
          wearableRecord.device = wearableData.device;

          // Add to registry
          return wearableDataRegistry.add(wearableRecord);
      });
}

/****
* Creates the record identifier
*/
function generateRecordId(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for(var i = 0; i < n; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}