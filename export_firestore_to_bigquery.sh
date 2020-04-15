# Copyright 2020 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     https://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
PROJECT_ID=[enter your GCP Project id here]
gsutil -m rm gs://$PROJECT_ID-backup/bq-export/**

bq --location=US mk --dataset latest

gcloud firestore export gs://$PROJECT_ID-backup/bq-export/accounts \
  --collection-ids=accounts
bq load \
  --source_format=DATASTORE_BACKUP \
  --replace \
  latest.accounts \
  gs://$PROJECT_ID-backup/bq-export/accounts/all_namespaces/kind_accounts/all_namespaces_kind_accounts.export_metadata

gcloud firestore export gs://$PROJECT_ID-backup/bq-export/wheels \
  --collection-ids=wheels
bq load \
  --source_format=DATASTORE_BACKUP \
  --replace \
  latest.wheels \
  gs://$PROJECT_ID-backup/bq-export/wheels/all_namespaces/kind_wheels/all_namespaces_kind_wheels.export_metadata

gcloud firestore export gs://$PROJECT_ID-backup/bq-export/shared-wheels \
  --collection-ids=shared-wheels
bq load \
  --source_format=DATASTORE_BACKUP \
  --replace \
  latest.shared_wheels \
  gs://$PROJECT_ID-backup/bq-export/shared-wheels/all_namespaces/kind_shared-wheels/all_namespaces_kind_shared-wheels.export_metadata

gsutil -m rm gs://$PROJECT_ID-backup/bq-export/**
