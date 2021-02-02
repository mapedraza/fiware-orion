/*
*
* Copyright 2020 Telefonica Investigacion y Desarrollo, S.A.U
*
* This file is part of Orion Context Broker.
*
* Orion Context Broker is free software: you can redistribute it and/or
* modify it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* Orion Context Broker is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
* General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with Orion Context Broker. If not, see http://www.gnu.org/licenses/.
*
* For those usages not covered by this license please contact with
* iot_support at tid dot es
*
* Author: Fermín Galán
*/

#include <string>
#include <vector>

#include "mongoDriver/BSONElement.h"

namespace orion
{
/* ****************************************************************************
*
* BSONElement::BSONElement -
*/
BSONElement::BSONElement(void)
{
}



/* ****************************************************************************
*
* BSONElement::type -
*
*/
BSONType BSONElement::type(void) const
{
  switch (be.type())
  {
  case mongo::MinKey:        return MinKey;
  case mongo::EOO:           return EOO;
  case mongo::NumberDouble:  return NumberDouble;
  case mongo::String:        return orion::String;
  case mongo::Object:        return Object;
  case mongo::Array:         return orion::Array;
  case mongo::BinData:       return BinData;
  case mongo::Undefined:     return Undefined;
  case mongo::jstOID:        return jstOID;
  case mongo::Bool:          return orion::Bool;
  case mongo::Date:          return Date;
  case mongo::jstNULL:       return jstNULL;
  case mongo::RegEx:         return RegEx;
  case mongo::DBRef:         return DBRef;
  case mongo::Code:          return Code;
  case mongo::Symbol:        return Symbol;
  case mongo::CodeWScope:    return CodeWScope;
  case mongo::NumberInt:     return NumberInt;
  case mongo::Timestamp:     return Timestamp;
  case mongo::NumberLong:    return NumberLong;
  case mongo::MaxKey:        return MaxKey;
  }

  // FIXME: maybe we should return some other thing...
  return EOO;
}



/* ****************************************************************************
*
* BSONElement::isNull -
*/
bool BSONElement::isNull(void)
{
  return be.isNull();
}



/* ****************************************************************************
*
* BSONElement::OID -
*/
std::string BSONElement::OID(void)
{
  return be.OID().toString();
}



/* ****************************************************************************
*
* BSONElement::String -
*/
std::string BSONElement::String(void) const
{
  return be.String();
}



/* ****************************************************************************
*
* BSONElement::Bool -
*/
bool BSONElement::Bool(void) const
{
  return be.Bool();
}


/* ****************************************************************************
*
* BSONElement::Number -
*/
double BSONElement::Number(void) const
{
  return be.Number();
}



/* ****************************************************************************
*
* BSONElement::Array -
*/
std::vector<BSONElement> BSONElement::Array(void) const
{
  std::vector<BSONElement> v;

  std::vector<mongo::BSONElement> bea = be.Array();
  for (unsigned int ix = 0; ix < bea.size(); ++ix)
  {
    v.push_back(BSONElement(bea[ix]));
  }
  return v;
}



/* ****************************************************************************
*
* BSONElement::embeddedObject -
*/
BSONObj BSONElement::embeddedObject(void) const
{
  return BSONObj(be.embeddedObject());
}



/* ****************************************************************************
*
* BSONElement::date -
*/
BSONDate BSONElement::date(void)
{
  return BSONDate(be.date());
}



/* ****************************************************************************
*
* BSONElement::fieldName -
*/
std::string BSONElement::fieldName(void) const
{
  return be.fieldName();
}



/* ****************************************************************************
*
* BSONElement::str -
*/
std::string BSONElement::str() const
{
  return be.str();
}



/* ****************************************************************************
*
* BSONElement::eoo -
*/
bool BSONElement::eoo(void) const
{
  return be.eoo();
}

// FIXME OLD-DR: drive C family

/* ****************************************************************************
*
* BSONElement::_type -
*
*/
BSONType BSONElement::_type(void) const
{
  switch (bv.value_type)
  {
  case BSON_TYPE_EOD:        return orion::EOO;
  case BSON_TYPE_DOUBLE:     return orion::NumberDouble;
  case BSON_TYPE_UTF8:       return orion::String;
  case BSON_TYPE_DOCUMENT:   return orion::Object;
  case BSON_TYPE_ARRAY:      return orion::Array;
  case BSON_TYPE_BINARY:     return orion::BinData;
  case BSON_TYPE_UNDEFINED:  return orion::Undefined;
  case BSON_TYPE_OID:        return orion::jstOID;
  case BSON_TYPE_BOOL:       return orion::Bool;
  case BSON_TYPE_DATE_TIME:  return orion::Date;
  case BSON_TYPE_NULL:       return orion::jstNULL;
  case BSON_TYPE_REGEX:      return orion::RegEx;
  case BSON_TYPE_DBPOINTER:  return orion::DBRef;
  case BSON_TYPE_CODE:       return orion::Code;
  case BSON_TYPE_SYMBOL:     return orion::Symbol;
  case BSON_TYPE_CODEWSCOPE: return orion::CodeWScope;
  case BSON_TYPE_INT32:      return orion::NumberInt;
  case BSON_TYPE_TIMESTAMP:  return orion::Timestamp;
  case BSON_TYPE_INT64:      return orion::NumberLong;
  case BSON_TYPE_DECIMAL128: return orion::BigDecimal;
  case BSON_TYPE_MAXKEY:     return orion::MaxKey;
  case BSON_TYPE_MINKEY:     return orion::MinKey;
  }

  // FIXME: maybe we should return some other thing...
  return orion::EOO;
}

// FIXME OLD-DR: type check should be enformed in Double(), String(), eg:
//
// value = bson_iter_value (&iter);
//
//if (value->value_type == BSON_TYPE_INT32) {
//   printf ("%d\n", value->value.v_int32);
//}


/* ****************************************************************************
*
* BSONElement::_isNull -
*/
bool BSONElement::_isNull(void)
{
  // FIXME OLD-DR: who calls this method?
  return (bv.value_type == BSON_TYPE_NULL);
}



/* ****************************************************************************
*
* BSONElement::_OID -
*/
std::string BSONElement::_OID(void)
{
  char str[25];  // OID fixed length is 24 chars
  bson_oid_to_string(&bv.value.v_oid, str);
  return std::string(str);
}



/* ****************************************************************************
*
* BSONElement::_String -
*/
std::string BSONElement::_String(void) const
{
  return std::string(bv.value.v_utf8.str);
}



/* ****************************************************************************
*
* BSONElement::_Bool -
*/
bool BSONElement::__Bool(void) const
{
  return bv.value.v_bool;
}


/* ****************************************************************************
*
* BSONElement::_Number -
*/
double BSONElement::_Number(void) const
{
  return bv.value.v_double;
}



/* ****************************************************************************
*
* BSONElement::_Array -
*/
std::vector<BSONElement> BSONElement::_Array(void) const
{
  std::vector<BSONElement> v;

  std::vector<mongo::BSONElement> bea = be.Array();
  for (unsigned int ix = 0; ix < bea.size(); ++ix)
  {
    v.push_back(BSONElement(bea[ix]));
  }
  return v;
}



/* ****************************************************************************
*
* BSONElement::_embeddedObject -
*/
BSONObj BSONElement::_embeddedObject(void) const
{
  size_t len    = (size_t) bv.value.v_doc.data_len;
  uint8_t* data = bv.value.v_doc.data;

  bson_t* b = bson_new_from_buffer(&data, &len, NULL, NULL);

  BSONObj bo(b);

  bson_destroy(b);

  return bo;
}



/* ****************************************************************************
*
* BSONElement::_date -
*/
BSONDate BSONElement::_date(void)
{
  // FIXME OLD-DR: pending
  //return BSONDate(be.date());
  return BSONDate(0);
}



/* ****************************************************************************
*
* BSONElement::_fieldName -
*/
std::string BSONElement::_fieldName(void) const
{
  return field;
}



/* ****************************************************************************
*
* BSONElement::_str -
*/
std::string BSONElement::_str() const
{
  // FIXME OLD-DR: probably this method can be removed. It's redundant. Who calls it?
  return String();
}



/* ****************************************************************************
*
* BSONElement::_eoo -
*/
bool BSONElement::_eoo(void) const
{
  // FIXME OLD-DR: who calls this method?
  return (bv.value_type == BSON_TYPE_NULL);
}

///////// from now on, only methods with low-level driver types in return or parameters /////////



/* ****************************************************************************
*
* BSONElement::BSONElement -
*/
BSONElement::BSONElement(const mongo::BSONElement& _be)
{
  be = _be;
}



/* ****************************************************************************
*
* BSONElement::get -
*/
mongo::BSONElement BSONElement::get(void) const
{
  return be;
}
}
