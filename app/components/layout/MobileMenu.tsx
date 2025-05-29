'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogin, onLogout }: MobileMenuProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-[280px]">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                    <div className="border-b border-gray-200 px-4 py-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-semibold text-gray-900">
                          메뉴
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="size-6" aria-hidden="true" />
                        </button>
                      </div>

                      {/* 로그인 섹션 */}
                      <div className="mt-6">
                        {user ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                  className="size-10 rounded-full"
                                />
                              ) : (
                                <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                                  <UserIcon className="size-6 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.displayName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                onLogout();
                                onClose();
                              }}
                              className="flex w-full items-center justify-center space-x-2 rounded-md bg-red-600 py-2 text-white transition-colors hover:bg-red-700"
                            >
                              <ArrowRightOnRectangleIcon className="size-5" />
                              <span>로그아웃</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <button
                              onClick={() => {
                                onLogin();
                                onClose();
                              }}
                              className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white py-2 text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <img src="/google-logo.png" alt="Google" className="size-5" />
                              <span>Google로 로그인</span>
                            </button>
                            <div className="flex justify-between text-sm">
                              <Link
                                href="#"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={onClose}
                              >
                                회원가입
                              </Link>
                              <Link
                                href="#"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={onClose}
                              >
                                아이디/비밀번호 찾기
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 메뉴 목록 */}
                    <div className="flex-1 px-4 py-6">
                      <nav className="space-y-1">
                        <Link
                          href="/"
                          className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={onClose}
                        >
                          <HomeIcon className="mr-4 size-6 shrink-0 text-gray-400 group-hover:text-gray-500" />
                          홈
                        </Link>
                        <Link
                          href="/board/free"
                          className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={onClose}
                        >
                          <ChatBubbleLeftRightIcon className="mr-4 size-6 shrink-0 text-gray-400 group-hover:text-gray-500" />
                          자유게시판
                        </Link>
                        <Link
                          href="/board/notice"
                          className="group flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={onClose}
                        >
                          <ChatBubbleLeftRightIcon className="mr-4 size-6 shrink-0 text-gray-400 group-hover:text-gray-500" />
                          공지사항
                        </Link>
                      </nav>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
