{{- define "assignment-backend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "assignment-backend.fullname" -}}
{{- printf "%s-%s" (default .Chart.Name .Values.nameOverride) .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

