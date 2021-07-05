import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, withRouter } from 'react-router-dom';
import { Avatar, Button, Paper, Grid, Typography, Container } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { GoogleLogin } from 'react-google-login';

import useForm from '../../hooks/useForm';
import { LOGIN } from '../../constants/constantsType';
import { showError, showSuccess } from '../../utils/showMessage';
import Input from './Input/Input';
import GoogleIcon from './GoogleIcon/GoogleIcon';
import { login, register } from '../../actions/authorize';
import { encodeBase64, decodeBase64 } from '../../utils/crypto.js';

import useStyles from './styles';


const Authorize = (props) => {
  const { info } = props.match.params;
  let error = null;
  if (info) {
    error = JSON.parse(decodeBase64(info)).error;
  }

  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const fromRef = useRef();
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTokenExpired, setisTokenExpired] = useState(!!error);
  const [errorText, setErrorText] = useState(null);

  const [formValues, setFormValues] = useForm({ firstName: '', lastName: '', email: 'useThisAccountOrGoogleAccount@login', password: 'TomAndJerry', confirmPassword: '' });

  const handleShowPassword = () => setShowPassword(!showPassword);

  const switchMode = () => {
    setShowPassword(false);
    setIsRegister(prevIsRegister => !prevIsRegister);
    fromRef.current.reset();
  }

  const googleSuccess = async (res) => {
    setisTokenExpired(false);
    dispatch({ type: LOGIN, payload: { ...res.profileObj, token: res.tokenId } });
    history.push('/');
    showSuccess('Google account login Success');
  };

  const googleError = (error) => {
    if (error.error !== 'popup_closed_by_user') {
      showError('Google account login failed');
      console.error(`Google account login failed with error: ${JSON.stringify(error)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = encodeBase64(formValues.password);
    if (isRegister) {
      if (formValues.password !== formValues.confirmPassword) {
        setErrorText(`Passwords doesn't match`);
        return;
      }
      dispatch(register({...formValues, password }, history));
    } else {
      dispatch(login({...formValues, password }, history));
    }
  }

  useEffect(() => {
    if (isTokenExpired) {
      showError('Certification expired, please login again');
    }
  }, [isTokenExpired])

  return (
    <Container component='main' maxWidth='xs'>
      <Paper className={classes.paper} elevation={6} >
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>{ isRegister ? 'Register' : 'Login' }</Typography>
        <form className={classes.form} onSubmit={handleSubmit} ref={fromRef} >
          <Grid container spacing={2}>
            { 
              isRegister && (
                <>
                  <Input handleChange={setFormValues} name='firstName' label='firstName' autoFocus half />
                  <Input handleChange={setFormValues} name='lastName' label='lastName' half />
                </> 
              )
            }
            <Input handleChange={setFormValues} value={formValues.email} name='email' label='email' type='email' />
            <Input handleChange={setFormValues} value={formValues.password} handleShowPassword={handleShowPassword} name='password' label='password' type={showPassword ? 'text' : 'password'} />
            { isRegister && <Input handleChange={setFormValues} name='confirmPassword' label='confirmPassword' type='password' errorText={errorText} /> }
          </Grid>
          <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
            { isRegister ? 'Register' : 'Login' }
          </Button>
          <GoogleLogin
            clientId='160069951274-9lk4icl4nvv4lbb61umon883c3rb6dtf.apps.googleusercontent.com'
            render={(renderProps) => (
              <Button onClick={renderProps.onClick} disabled={renderProps.disabled} className={classes.googleButton} fullWidth color='primary' startIcon={<GoogleIcon />} variant='contained'>
                Google Account Login
              </Button>
            )}
            onSuccess={googleSuccess}
            onFailure={googleError}
            cookiePolicy='single_host_origin'
          />
          <Grid container justify='flex-end'>
            <Grid item>
              <Button style={{ textTransform: 'none' }} onClick={switchMode}>
                { isRegister ? `Already have an account? Login` : `Don't have an account? Register` }
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default withRouter(Authorize);
