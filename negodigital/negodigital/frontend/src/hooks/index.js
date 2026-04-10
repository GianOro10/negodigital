import { useState, useEffect, useCallback } from 'react';
import { businessAPI } from '../utils/api';

// ─── Hook: Fetch businesses with filters ───
export function useBusinesses(initialParams = {}) {
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessAPI.getAll(params);
      setBusinesses(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const updateFilters = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      setParams((prev) => ({ ...prev, page: prev.page ? prev.page + 1 : 2 }));
    }
  }, [pagination]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setParams((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination]);

  return {
    businesses,
    pagination,
    loading,
    error,
    updateFilters,
    nextPage,
    prevPage,
    refresh: fetchBusinesses,
  };
}

// ─── Hook: Form state management with validation ───
export function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    Object.entries(validationRules).forEach(([field, rules]) => {
      for (const rule of rules) {
        const error = rule(values[field], values);
        if (error) {
          newErrors[field] = error;
          break;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();
      // Touch all fields
      const allTouched = {};
      Object.keys(validationRules).forEach((f) => (allTouched[f] = true));
      setTouched(allTouched);

      if (!validate()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, validationRules]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
  };
}

// ─── Validation helpers ───
export const validators = {
  required: (msg = 'Campo obligatorio') => (v) => (!v || !v.toString().trim() ? msg : null),
  minLength: (min, msg) => (v) => (v && v.length < min ? msg || `Mínimo ${min} caracteres` : null),
  maxLength: (max, msg) => (v) => (v && v.length > max ? msg || `Máximo ${max} caracteres` : null),
  email: (msg = 'Email no válido') => (v) => (v && !/^\S+@\S+\.\S+$/.test(v) ? msg : null),
  password: (msg = 'Mín. 8 caracteres, 1 mayúscula, 1 número') => (v) =>
    v && (v.length < 8 || !/[A-Z]/.test(v) || !/\d/.test(v)) ? msg : null,
  phone: (msg = 'Mínimo 10 dígitos') => (v) =>
    v && v.replace(/\D/g, '').length < 10 ? msg : null,
  match: (field, msg = 'Los campos no coinciden') => (v, values) =>
    v !== values[field] ? msg : null,
};
