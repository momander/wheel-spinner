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

gcloud firestore export gs://$PROJECT_ID \
    --project=PROJECT_ID

# Export specific collection.
# gcloud firestore export gs://$PROJECT_ID \
#    --project=$PROJECT_ID \
#    --collection-ids=shared-wheels

# Import into test environment (skip last line to import all collections).
# gcloud firestore import gs://$PROJECT_ID-backup/2020-03-22T17:47:21_54737 \
#    --project=$PROJECT_ID-test \
#    --collection-ids=shared-wheels
